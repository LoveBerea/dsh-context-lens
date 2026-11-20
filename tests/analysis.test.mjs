import test from 'node:test'
import assert from 'node:assert/strict'
import {
  analyzeEvents, compareContexts, comparisonFor, hashOf, reasoningOf, responseOf, summarizeMessages, textOf,
} from '../src/analysis.js'

function message(content, id) {
  return { role: 'assistant', id, content }
}

function event(type, data, seq, extra = {}) {
  return { type: 'event', event: { type, data, seq, time: seq, ...extra } }
}

test('reads text and reasoning blocks without mixing them', () => {
  const content = [
    { type: 'reasoning', text: 'why' },
    { kind: 'text', text: 'answer' },
    { type: 'image', source: {} },
  ]
  assert.equal(textOf(content), 'why\nanswer')
  assert.equal(responseOf(content), 'answer')
  assert.equal(reasoningOf(content), 'why')
  assert.equal(hashOf('abc').length, 8)
})

test('summarizes provider messages into comparable items', () => {
  const items = summarizeMessages([
    { role: 'user', content: [{ type: 'text', text: 'hello' }] },
    message([{ type: 'reasoning', text: 'think' }, { type: 'text', text: 'done' }], 'a1'),
  ])
  assert.equal(items.length, 2)
  assert.equal(items[0].text, 'hello')
  assert.equal(items[1].reasoning, 'think')
  assert.equal(items[1].id, 'a1')
})

test('detects prefix, additions, removals, and replayed reasoning', () => {
  const previous = [
    { role: 'user', id: 'u1', text: 'question', reasoning: '' },
    { role: 'assistant', id: 'a1', text: 'first', reasoning: 'plan A' },
  ]
  const current = [
    { role: 'user', id: 'u1', text: 'question', reasoning: '' },
    { role: 'assistant', id: 'a1', text: 'first', reasoning: 'plan A' },
    { role: 'assistant', id: 'a2', text: 'second', reasoning: 'plan A' },
    { role: 'user', id: 'u2', text: 'follow-up', reasoning: '' },
  ]
  const result = compareContexts(previous, current, { turn: 2, step: 1 })
  assert.equal(result.commonPrefix, 2)
  assert.equal(result.shared, 2)
  assert.equal(result.added.length, 2)
  assert.equal(result.removed.length, 0)
  assert.equal(result.replayedReasoning.length, 2)
  assert.equal(result.overlapRatio, 0.5)
  assert.equal(result.newCount, 2)
  assert.equal(result.newRatio, 0.5)
  assert.equal(result.prefixRatio, 0.5)
  assert.equal(result.replayRatio, 1)
})

test('counts removed context when compaction replaces history', () => {
  const previous = [{ role: 'user', id: 'u1', text: 'old', reasoning: '' }]
  const current = [{ role: 'user', id: 'u2', text: 'new', reasoning: '' }]
  const result = compareContexts(previous, current)
  assert.equal(result.commonPrefix, 0)
  assert.equal(result.added.length, 1)
  assert.equal(result.removed.length, 1)
  assert.equal(result.overlapRatio, 0)
})

test('rebuilds per-step contexts and turn outputs from a session window', () => {
  const entries = [
    event('turn/start', { turn: 1 }, 1),
    event('step/start', { turn: 1, step: 1 }, 2),
    event('user/message', { content: [{ type: 'text', text: 'hello' }], source: { kind: 'user' } }, 3),
    event('assistant/message', {
      turn: 1,
      step: 1,
      message: message([{ type: 'reasoning', text: 'think' }, { type: 'text', text: 'hi' }], 'a1'),
    }, 4),
    event('tool/call', { turn: 1, step: 1, callId: 'c1', name: 'read', arguments: '{}' }, 5),
    event('step/start', { turn: 1, step: 2 }, 6),
    event('assistant/message', {
      turn: 1,
      step: 2,
      message: message([{ type: 'reasoning', text: 'think' }, { type: 'text', text: 'more' }], 'a2'),
    }, 7),
    event('step/start', { turn: 1, step: 3 }, 8),
    event('assistant/message', {
      turn: 1,
      step: 3,
      message: message([{ type: 'reasoning', text: 'think' }, { type: 'text', text: 'again' }], 'a3'),
    }, 9),
  ]
  const analysis = analyzeEvents(entries)
  assert.equal(analysis.steps.length, 3)
  assert.equal(analysis.steps[0].items.length, 1)
  assert.equal(analysis.steps[1].items.length, 2)
  assert.equal(analysis.comparisons.length, 3)
  assert.equal(analysis.outputs.length, 3)
  assert.equal(analysis.outputs[0].reasoning, 'think')
  assert.equal(analysis.outputs[0].tools[0].name, 'read')
  assert.equal(analysis.comparisons[2].replayedReasoning.length, 2)
  assert.equal(comparisonFor(analysis, 1, 3).atSeq, 9)
  assert.equal(comparisonFor(analysis, 9, 1), null)
})

test('applies surface replace before rebuilding later contexts', () => {
  const entries = [
    event('user/message', { content: [{ type: 'text', text: 'old' }] }, 1),
    event('user/message', { content: [{ type: 'text', text: 'kept' }] }, 2),
    event('assistant/message', {
      turn: 1, step: 1, message: message([{ type: 'text', text: 'a' }], 'a1'),
    }, 3),
    event('user/message', { content: [{ type: 'text', text: 'fresh' }] }, 4, {
      surfaceOp: { op: 'replace', startSeq: 1, endSeq: 1 },
    }),
    event('assistant/message', {
      turn: 2, step: 1, message: message([{ type: 'text', text: 'b' }], 'a2'),
    }, 5),
  ]
  const analysis = analyzeEvents(entries)
  assert.deepEqual(analysis.steps[0].items.map(item => item.text), ['old', 'kept'])
  assert.deepEqual(analysis.steps[1].items.map(item => item.text), ['kept', 'a', 'fresh'])
  assert.equal(analysis.comparisons[1].added.length, 2)
  assert.equal(analysis.comparisons[1].removed.length, 1)
})

test('grows overlap below 100% and compares against previous or several turns', () => {
  const entries = [
    event('step/start', { turn: 1, step: 1 }, 1),
    event('user/message', { content: [{ type: 'text', text: 'first' }] }, 2),
    event('step/start', { turn: 2, step: 1 }, 3),
    event('assistant/message', {
      turn: 2,
      step: 1,
      message: message([{ type: 'reasoning', text: 'plan' }, { type: 'text', text: 'a' }], 'a1'),
    }, 4),
    event('step/start', { turn: 3, step: 1 }, 5),
    event('assistant/message', {
      turn: 3,
      step: 1,
      message: message([{ type: 'reasoning', text: 'plan' }, { type: 'text', text: 'b' }], 'a2'),
    }, 6),
  ]
  const analysis = analyzeEvents(entries)
  const recent = comparisonFor(analysis, 3, 1, 'recent')
  assert.equal(recent.overlapRatio, 0.5)
  assert.equal(recent.newCount, 1)
  assert.equal(recent.replayedReasoning.length, 1)
  assert.equal(comparisonFor(analysis, 3, 1, 'previous').lookback, 1)
  assert.equal(comparisonFor(analysis, 3, 1, 'all').lookback, 'all')
  assert.equal(analysis.comparisons[0].recent.overlapRatio, 0)
})
