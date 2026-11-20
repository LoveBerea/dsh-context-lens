/**
 * Browser bundle template. `build.mjs` inlines the shared analysis module below.
 * The published client.js is generated and committed so git installs need no build.
 */
window.__ModuleLoader__.load({
  id: 'dsh-context-lens',
  meta() {
    return {
      stylesheets: {
        'context-lens.css': {
          text: () => `
[data-context-lens] { box-sizing: border-box; margin: 8px 0 12px; border: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.24)); border-radius: var(--dsw-radius-lg, 10px); background: var(--dsw-specific-panel, rgba(127,127,127,.05)); color: var(--dsw-alias-label-primary, inherit); font-size: 13px; line-height: 20px; overflow: hidden; }
[data-context-lens] * { box-sizing: border-box; }
[data-context-lens] .cl-head { display: flex; align-items: center; gap: 8px; padding: 8px 12px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.18)); }
[data-context-lens] .cl-mark { flex: none; display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); font-size: 11px; }
[data-context-lens] .cl-heading { min-width: 0; flex: 1; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
[data-context-lens] .cl-tag { flex: none; padding: 1px 7px; border-radius: 999px; background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.14)); color: var(--dsw-alias-label-secondary, inherit); font-size: 11px; }
[data-context-lens] .cl-stats { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px 12px 4px; }
[data-context-lens] .cl-stat { min-width: 84px; padding: 5px 8px; border-radius: 8px; background: var(--dsw-alias-interactive-bg, rgba(127,127,127,.08)); }
[data-context-lens] .cl-statLabel { display: block; color: var(--dsw-alias-label-tertiary, inherit); font-size: 11px; line-height: 14px; }
[data-context-lens] .cl-statValue { display: block; font-size: 14px; font-weight: 500; line-height: 20px; font-variant-numeric: tabular-nums; }
[data-context-lens] .cl-stat[data-tone='warn'] .cl-statValue { color: var(--dsw-alias-state-warning-primary, #b7791f); }
[data-context-lens] .cl-bar { height: 4px; margin: 4px 12px 8px; border-radius: 999px; background: var(--dsw-alias-interactive-bg, rgba(127,127,127,.1)); overflow: hidden; }
[data-context-lens] .cl-barFill { height: 100%; border-radius: inherit; background: var(--dsw-alias-interactive-accent, #4c8bf5); }
[data-context-lens] .cl-folds { padding: 0 12px 10px; }
[data-context-lens] .cl-fold + .cl-fold { margin-top: 4px; }
[data-context-lens] .cl-foldHead { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 28px; padding: 2px 4px; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
[data-context-lens] .cl-foldHead:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1)); }
[data-context-lens] .cl-foldHead:focus-visible { outline: 2px solid var(--dsw-alias-interactive-accent, #4c8bf5); outline-offset: -2px; }
[data-context-lens] .cl-glyph { flex: none; width: 18px; color: var(--dsw-alias-label-tertiary, inherit); text-align: center; }
[data-context-lens] .cl-foldTitle { flex: none; font-weight: 500; }
[data-context-lens] .cl-preview { min-width: 0; flex: 1; color: var(--dsw-alias-label-tertiary, inherit); font-size: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
[data-context-lens] .cl-chevron { flex: none; color: var(--dsw-alias-label-tertiary, inherit); }
[data-context-lens] .cl-foldBody { padding: 4px 4px 8px 26px; }
[data-context-lens] .cl-text { max-height: 280px; margin: 0; padding: 8px 10px; border-radius: 8px; background: var(--dsw-alias-interactive-bg, rgba(127,127,127,.07)); font: inherit; white-space: pre-wrap; overflow-wrap: anywhere; overflow: auto; }
[data-context-lens] .cl-empty { color: var(--dsw-alias-label-tertiary, inherit); }
[data-context-lens] .cl-entry { padding: 5px 8px; border-left: 2px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3)); margin-top: 4px; }
[data-context-lens] .cl-entry[data-role='assistant'] { border-left-color: var(--dsw-alias-interactive-accent, #4c8bf5); }
[data-context-lens] .cl-entry[data-role='tool'] { border-left-color: var(--dsw-alias-state-warning-primary, #b7791f); }
[data-context-lens] .cl-entryHead { display: flex; gap: 8px; color: var(--dsw-alias-label-secondary, inherit); font-size: 11px; }
[data-context-lens] .cl-entryText { max-height: 120px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
[data-context-lens] .cl-note { padding: 0 12px 10px; color: var(--dsw-alias-label-tertiary, inherit); font-size: 12px; }
`,
        },
      },
    }
  },
  factory(require) {
    const React = require('react')
    const { createElement: h, useCallback, useState, useSyncExternalStore } = React

    %%ANALYSIS%%

    const NS = 'contextLens'
    const zh = {
      title: '上下文缓存分析',
      turn: '第 {turn} 轮',
      step: '第 {step} 步',
      prefix: '连续重合',
      overlap: '上下文重合',
      added: '新增',
      removed: '移除',
      replay: '思考重注入',
      contextDiff: '上下文差异',
      reasoning: '思考过程',
      response: '正式输出',
      tools: '工具调用',
      noComparison: '尚无相邻请求可比对',
      firstRequest: '首次请求，无历史上下文',
      emptyReasoning: '本轮没有思考内容',
      emptyResponse: '本轮没有正式输出',
      emptyTools: '本轮没有工具调用',
      noAdded: '没有新增上下文',
      noRemoved: '没有移除上下文',
      items: '{count} 条',
      replayHint: '此前轮次的思考内容再次进入本次请求',
    }
    const en = {
      title: 'Context cache analysis',
      turn: 'Turn {turn}',
      step: 'Step {step}',
      prefix: 'Common prefix',
      overlap: 'Context overlap',
      added: 'Added',
      removed: 'Removed',
      replay: 'Reasoning replay',
      contextDiff: 'Context differences',
      reasoning: 'Reasoning',
      response: 'Response',
      tools: 'Tool calls',
      noComparison: 'No adjacent request to compare',
      firstRequest: 'First request, no prior context',
      emptyReasoning: 'No reasoning in this step',
      emptyResponse: 'No response in this step',
      emptyTools: 'No tool calls in this step',
      noAdded: 'No context added',
      noRemoved: 'No context removed',
      items: '{count} items',
      replayHint: 'Reasoning from an earlier turn entered this request again',
    }

    const EMPTY = { steps: [], outputs: [], comparisons: [], surface: [] }
    const EMPTY_SOURCE = { getSnapshot: () => EMPTY, subscribe: () => () => {}, dispose: () => {} }

    /** Per-session observable over the loaded event window, recomputed once per revision. */
    function createSource(binding) {
      if (binding === null || binding === undefined || binding.eventSource === undefined) return EMPTY_SOURCE
      let snapshot = EMPTY
      let revision = -1
      let unsubscribe = null
      const listeners = new Set()
      const recompute = () => {
        const window = binding.eventSource.getSnapshot()
        if (window.revision === revision) return
        revision = window.revision
        snapshot = analyzeEvents(window.entries)
        for (const listener of listeners) listener()
      }
      return {
        getSnapshot: () => snapshot,
        subscribe(listener) {
          listeners.add(listener)
          if (listeners.size === 1) {
            unsubscribe = binding.eventSource.subscribe(recompute)
            recompute()
          }
          return () => {
            listeners.delete(listener)
            if (listeners.size !== 0 || unsubscribe === null) return
            unsubscribe()
            unsubscribe = null
          }
        },
        dispose() {
          if (unsubscribe !== null) unsubscribe()
          unsubscribe = null
          listeners.clear()
        },
      }
    }

    function Fold({ glyph, title, preview, open, onToggle, children }) {
      return h('div', { className: 'cl-fold' },
        h('button', {
          type: 'button', className: 'cl-foldHead', 'aria-expanded': open, onClick: onToggle,
        },
          h('span', { className: 'cl-glyph' }, glyph),
          h('span', { className: 'cl-foldTitle' }, title),
          preview ? h('span', { className: 'cl-preview' }, preview) : null,
          h('span', { className: 'cl-chevron', 'aria-hidden': 'true' }, open ? '▾' : '▸'),
        ),
        open ? h('div', { className: 'cl-foldBody' }, children) : null,
      )
    }

    function Stat({ label, value, tone }) {
      return h('div', { className: 'cl-stat', 'data-tone': tone },
        h('span', { className: 'cl-statLabel' }, label),
        h('span', { className: 'cl-statValue' }, value),
      )
    }

    function Entries({ items, t }) {
      if (items.length === 0) return h('p', { className: 'cl-empty' }, t('noAdded'))
      return items.map((item, index) => h('div', {
        className: 'cl-entry', key: `${item.role}-${index}`, 'data-role': item.role,
      },
        h('div', { className: 'cl-entryHead' },
          h('span', {}, item.role),
          item.reasoning ? h('span', {}, t('replay')) : null,
        ),
        h('div', { className: 'cl-entryText' }, item.text || item.reasoning),
      ))
    }

    function EntriesRemoved({ items, t }) {
      if (items.length === 0) return h('p', { className: 'cl-empty' }, t('noRemoved'))
      return items.map((item, index) => h('div', {
        className: 'cl-entry', key: `${item.role}-${index}`, 'data-role': item.role,
      },
        h('div', { className: 'cl-entryHead' }, h('span', {}, item.role)),
        h('div', { className: 'cl-entryText' }, item.text || item.reasoning),
      ))
    }

    function LensNodeView({ node, t, useLens }) {
      const analysis = useLens()
      const data = node.data ?? {}
      const comparison = comparisonFor(analysis, data.turn, data.step)
      const [open, setOpen] = useState({ context: false, reasoning: false, response: false, tools: false })
      const toggle = useCallback(key => () => {
        setOpen(previous => ({ ...previous, [key]: !previous[key] }))
      }, [])

      const ratio = Math.round((comparison?.overlapRatio ?? 0) * 100)
      const prefix = Math.round((comparison?.prefixRatio ?? 0) * 100)
      const replayCount = comparison?.replayedReasoning?.length ?? 0
      const output = (analysis.outputs ?? []).find(item => item.turn === data.turn && item.step === data.step)
      const tools = output?.tools ?? []
      const preview = (text) => text.length > 72 ? `${text.slice(0, 72)}…` : text

      return h('section', { className: 'cl-root', 'data-context-lens': '' },
        h('header', { className: 'cl-head' },
          h('span', { className: 'cl-mark', 'aria-hidden': 'true' }, '◫'),
          h('span', { className: 'cl-heading' }, t('title')),
          h('span', { className: 'cl-tag' }, t('turn', { turn: data.turn })),
          h('span', { className: 'cl-tag' }, t('step', { step: data.step })),
        ),
        comparison === null
          ? h('p', { className: 'cl-note' }, t('noComparison'))
          : h('div', {},
            h('div', { className: 'cl-stats' },
              h(Stat, { label: t('prefix'), value: `${prefix}%` }),
              h(Stat, { label: t('overlap'), value: `${ratio}%` }),
              h(Stat, {
                label: t('added'), value: t('items', { count: comparison.added.length }),
              }),
              h(Stat, {
                label: t('removed'), value: t('items', { count: comparison.removed.length }),
              }),
              h(Stat, {
                label: t('replay'), value: t('items', { count: replayCount }), tone: replayCount > 0 ? 'warn' : undefined,
              }),
            ),
            h('div', { className: 'cl-bar', 'aria-hidden': 'true' },
              h('div', { className: 'cl-barFill', style: { width: `${ratio}%` } }),
            ),
          ),
        h('div', { className: 'cl-folds' },
          h(Fold, {
            glyph: '≷', title: t('contextDiff'),
            preview: comparison === null ? t('firstRequest')
              : `${comparison.added.length} + / ${comparison.removed.length} −`,
            open: open.context, onToggle: toggle('context'),
          },
            comparison === null ? null : h('div', {},
              replayCount > 0 ? h('p', { className: 'cl-note' }, t('replayHint')) : null,
              h(Entries, { items: comparison.added, t }),
              h(EntriesRemoved, { items: comparison.removed, t }),
            ),
          ),
          h(Fold, {
            glyph: '◌', title: t('reasoning'), preview: preview(data.reasoning ?? ''),
            open: open.reasoning, onToggle: toggle('reasoning'),
          },
            data.reasoning
              ? h('pre', { className: 'cl-text' }, data.reasoning)
              : h('p', { className: 'cl-empty' }, t('emptyReasoning')),
          ),
          h(Fold, {
            glyph: '✓', title: t('response'), preview: preview(data.response ?? ''),
            open: open.response, onToggle: toggle('response'),
          },
            data.response
              ? h('pre', { className: 'cl-text' }, data.response)
              : h('p', { className: 'cl-empty' }, t('emptyResponse')),
          ),
          h(Fold, {
            glyph: '⌘', title: t('tools'), preview: t('items', { count: tools.length }),
            open: open.tools, onToggle: toggle('tools'),
          },
            tools.length === 0
              ? h('p', { className: 'cl-empty' }, t('emptyTools'))
              : tools.map(tool => h('div', { className: 'cl-entry', key: tool.callId },
                h('div', { className: 'cl-entryHead' }, h('span', {}, tool.name)),
                h('div', { className: 'cl-entryText' }, tool.arguments),
              )),
          ),
        ),
      )
    }

    const definition = {
      kind: 'context-lens-turn',
      target: 'chat',
      match(event) {
        if (event.type !== 'assistant/message') return null
        const { turn, step } = event.data
        return { id: `context-lens-${turn}-${step}`, role: 'start' }
      },
      start(context, match) {
        const data = match.event.data
        return {
          turn: data.turn,
          step: data.step,
          reasoning: reasoningOf(data.message?.content),
          response: responseOf(data.message?.content),
          tools: [],
          interrupted: data.interrupted === true,
        }
      },
      update(context) { return context.state },
      buildViewNode(context) {
        return {
          key: context.key,
          kind: 'context-lens-turn',
          id: context.id,
          target: 'chat',
          anchorSeq: context.start === undefined ? 0 : context.start.event.seq,
          location: context.start === undefined ? { kind: 'unresolved' } : context.start.location,
          visibility: 'visible',
          data: context.state,
        }
      },
    }

    return {
      inject: ['uiConversation', 'sessions', 'slots', 'locale'],
      apply(ctx) {
        ctx.uiConversation.events.register(definition)
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'context-lens: dictionaries')

        const sources = new Map()
        const sourceFor = (sessionId) => {
          const key = sessionId == null ? '' : String(sessionId)
          if (sources.has(key)) return sources.get(key)
          const source = createSource(ctx.sessions.binding(sessionId))
          sources.set(key, source)
          return source
        }
        ctx.effect(() => () => {
          for (const source of sources.values()) source.dispose()
          sources.clear()
        }, 'context-lens: session sources')

        ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
          name: 'conversation.chat.node',
          key: 'context-lens-turn',
          locale: NS,
          inject: sessionId => ({
            useLens: () => useSyncExternalStore(
              sourceFor(sessionId).subscribe, sourceFor(sessionId).getSnapshot,
            ),
          }),
        }, LensNodeView))
      },
    }
  },
})
