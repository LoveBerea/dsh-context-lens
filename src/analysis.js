/**
 * Pure context-overlap analysis shared by the Host capture and the Web view.
 * No Node or browser globals: the client bundle inlines this module verbatim.
 */

/** Read plain text from a provider-neutral content block list. */
export function textOf(content) {
  if (typeof content === 'string') return content
  if (!Array.isArray(content)) return ''
  const parts = []
  for (const block of content) {
    if (block === null || typeof block !== 'object') continue
    const kind = block.kind ?? block.type
    if (kind === 'text' || kind === 'reasoning' || kind === 'input_text' || kind === 'output_text') {
      if (typeof block.text === 'string' && block.text.length > 0) parts.push(block.text)
    }
  }
  return parts.join('\n')
}

/** Read visible response text, excluding reasoning blocks. */
export function responseOf(content) {
  if (!Array.isArray(content)) return ''
  return textOf(content.filter(block => block !== null && typeof block === 'object'
    && (block.kind ?? block.type) !== 'reasoning'))
}

/** Read only reasoning blocks from a provider-neutral content block list. */
export function reasoningOf(content) {
  if (!Array.isArray(content)) return ''
  const parts = []
  for (const block of content) {
    if (block === null || typeof block !== 'object') continue
    const kind = block.kind ?? block.type
    if (kind === 'reasoning' && typeof block.text === 'string' && block.text.length > 0) parts.push(block.text)
  }
  return parts.join('\n')
}

/** Small stable digest for identity-free messages and reasoning blocks. */
export function hashOf(value) {
  let hash = 0x811c9dc5
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/** Convert provider request messages into comparable context items. */
export function summarizeMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages.map((message, index) => ({
    role: typeof message?.role === 'string' ? message.role : 'unknown',
    id: typeof message?.id === 'string' ? message.id : `index:${index}`,
    text: textOf(message?.content),
    reasoning: reasoningOf(message?.content),
    seq: index,
  }))
}

function identityOf(item) {
  return `${item.role}:${item.id.startsWith('index:') ? hashOf(`${item.text}\u0000${item.reasoning}`) : item.id}`
}

/** Stable identity usable as a React key across turns and windows. */
export function itemKeyOf(item) {
  return identityOf(item)
}

function reasoningIdentityOf(item) {
  return hashOf(item.reasoning.trim())
}

function multiset(items) {
  const counts = new Map()
  for (const item of items) {
    const key = identityOf(item)
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return counts
}

/**
 * Compare two ordered input contexts. “Replayed reasoning” means an assistant
 * reasoning block in the later context whose text was already present earlier.
 */
export function compareContexts(previous, current, meta = {}) {
  const before = Array.isArray(previous) ? previous : []
  const after = Array.isArray(current) ? current : []
  const beforeCounts = multiset(before)
  const afterCounts = multiset(after)

  let commonPrefix = 0
  while (commonPrefix < before.length && commonPrefix < after.length
    && identityOf(before[commonPrefix]) === identityOf(after[commonPrefix])) {
    commonPrefix += 1
  }

  let shared = 0
  for (const [key, count] of afterCounts) shared += Math.min(count, beforeCounts.get(key) ?? 0)
  const added = after.filter(item => {
    const key = identityOf(item)
    const seen = beforeCounts.get(key) ?? 0
    if (seen <= 0) return true
    beforeCounts.set(key, seen - 1)
    return false
  })
  const removed = before.filter(item => {
    const key = identityOf(item)
    const seen = afterCounts.get(key) ?? 0
    if (seen <= 0) return true
    afterCounts.set(key, seen - 1)
    return false
  })

  const priorReasoning = new Set([
    ...before.filter(item => item.reasoning).map(reasoningIdentityOf),
    ...(Array.isArray(meta.priorReasoning)
      ? meta.priorReasoning.filter(text => typeof text === 'string' && text.length > 0).map(text => hashOf(text.trim()))
      : []),
  ])
  const reasoning = after.filter(item => item.reasoning)
  const replayedReasoning = reasoning.filter(item => priorReasoning.has(reasoningIdentityOf(item)))

  const denominator = Math.max(after.length, 1)
  return {
    ...meta,
    previousCount: before.length,
    currentCount: after.length,
    commonPrefix,
    prefixRatio: commonPrefix / denominator,
    shared,
    /** Share of THIS round's context already seen earlier: below 100% whenever new context arrives. */
    overlapRatio: shared / denominator,
    newCount: after.length - shared,
    newRatio: 1 - shared / denominator,
    added,
    removed,
    reasoningCount: reasoning.length,
    replayedReasoning,
    replayRatio: reasoning.length === 0 ? 0 : replayedReasoning.length / reasoning.length,
  }
}

function contentId(role, text, reasoning = '') {
  return hashOf(`${role}\u0000${text}\u0000${reasoning}`)
}

function itemFromEvent(event) {
  const data = event.data
  switch (event.type) {
    case 'system/message':
    case 'developer/message': {
      const text = textOf(data.message?.content)
      return { role: 'system', id: contentId('system', text), text, reasoning: '', seq: event.seq }
    }
    case 'user/message': {
      const text = textOf(data.content)
      return { role: 'user', id: contentId('user', text), text, reasoning: '', seq: event.seq }
    }
    case 'assistant/message': {
      const text = responseOf(data.message?.content)
      const reasoning = reasoningOf(data.message?.content)
      return {
        role: 'assistant',
        id: typeof data.message?.id === 'string' ? data.message.id : contentId('assistant', text, reasoning),
        text,
        reasoning,
        seq: event.seq,
      }
    }
    case 'tool/result': {
      const text = textOf(data.message?.content)
      return { role: 'tool', id: contentId('tool', text), text, reasoning: '', seq: event.seq }
    }
    default:
      return null
  }
}

/** Apply a surface replacement to the materialized context items. */
function applySurfaceOperation(surface, event) {
  const operation = event.surfaceOp
  if (operation === null || typeof operation !== 'object' || operation.op !== 'replace') return
  const start = typeof operation.startSeq === 'number' ? operation.startSeq : Number.NEGATIVE_INFINITY
  const end = typeof operation.endSeq === 'number' ? operation.endSeq : Number.POSITIVE_INFINITY
  for (let index = surface.length - 1; index >= 0; index -= 1) {
    const item = surface[index]
    if (item.seq >= start && item.seq <= end) surface.splice(index, 1)
  }
}

/**
 * Rebuild per-step contexts, per-turn outputs, and consecutive comparisons
 * from a loaded Session event window. Compaction replacements are honored.
 */
export function analyzeEvents(entries) {
  const surface = []
  const steps = []
  const outputs = []
  const toolCalls = new Map()

  for (const entry of Array.isArray(entries) ? entries : []) {
    const event = entry && entry.type === 'event' ? entry.event : entry
    if (event === null || typeof event !== 'object' || event.data == null) continue
    const data = event.data

    if (event.type === 'tool/call') {
      const key = `${data.turn}:${data.step}`
      const calls = toolCalls.get(key) ?? []
      calls.push({ name: data.name, callId: data.callId, arguments: data.arguments })
      toolCalls.set(key, calls)
      continue
    }

    const item = itemFromEvent(event)
    if (item === null) continue
    const isAssistant = event.type === 'assistant/message'
    if (isAssistant) {
      steps.push({ turn: data.turn, step: data.step, seq: event.seq, items: surface.map(item => ({ ...item })) })
    }
    applySurfaceOperation(surface, event)
    surface.push(item)

    if (isAssistant) {
      const key = `${data.turn}:${data.step}`
      outputs.push({
        turn: data.turn,
        step: data.step,
        seq: event.seq,
        reasoning: item.reasoning,
        response: item.text,
        interrupted: data.interrupted === true,
        tools: toolCalls.get(key) ?? [],
      })
    }
  }

  for (const output of outputs) {
    output.tools = toolCalls.get(`${output.turn}:${output.step}`) ?? []
  }

  const dedupe = (items) => {
    const seen = new Set()
    return items.filter(item => {
      const key = identityOf(item)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  const comparisons = steps.map((step, index) => {
    const meta = { turn: step.turn, step: step.step, atSeq: step.seq }
    const current = dedupe(step.items)
    const immediate = index === 0 ? [] : dedupe(steps[index - 1].items)
    const unionOf = (count) => {
      const from = count === Infinity ? 0 : Math.max(0, index - count)
      return dedupe(steps.slice(from, index).flatMap(candidate => candidate.items))
    }
    const prefix = (prior) => {
      let length = 0
      while (length < prior.length && length < current.length
        && identityOf(prior[length]) === identityOf(current[length])) {
        length += 1
      }
      return length
    }
    const build = (prior, lookback, from) => {
      const priorReasoning = outputs.slice(from, index).map(output => output.reasoning).filter(Boolean)
      const result = compareContexts(prior, current, { ...meta, lookback, priorReasoning })
      result.commonPrefix = prefix(immediate)
      result.prefixRatio = result.commonPrefix / Math.max(current.length, 1)
      result.currentItems = current
      result.priorItems = prior
      return result
    }
    const previous = build(immediate, 1, Math.max(0, index - 1))
    const recent = build(unionOf(3), 3, Math.max(0, index - 3))
    const all = build(unionOf(Infinity), 'all', 0)
    return { ...meta, previous, recent, all, ...recent }
  })

  return { steps, outputs, comparisons, surface }
}

/** Find one comparison for a turn and step in the requested lookback window. */
export function comparisonFor(analysis, turn, step, window = 'recent') {
  const list = analysis?.comparisons ?? []
  const found = list.find(item => item.turn === turn && item.step === step)
    ?? list.find(item => item.turn === turn)
  if (found === undefined || found === null) return null
  return found[window] ?? found.recent ?? null
}
