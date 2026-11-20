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
[data-context-lens-page] { box-sizing: border-box; display: flex; flex-direction: column; height: 100%; min-height: 0; background: var(--dsw-alias-bg-canvas, transparent); color: var(--dsw-alias-label-primary, inherit); font-size: 13px; line-height: 20px; }
[data-context-lens-page] * { box-sizing: border-box; }
[data-context-lens-page] .clp-top { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; padding: 14px 20px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.2)); }
[data-context-lens-page] .clp-title { margin: 0; flex: 1; min-width: 180px; font-size: 16px; font-weight: 500; }
[data-context-lens-page] .clp-control { display: inline-flex; align-items: center; gap: 6px; color: var(--dsw-alias-label-tertiary, inherit); }
[data-context-lens-page] select { height: 28px; max-width: 220px; padding: 2px 8px; border: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.24)); border-radius: 6px; background: var(--dsw-alias-bg-subtle, rgba(127,127,127,.08)); color: inherit; font: inherit; }
[data-context-lens-page] .clp-summary { display: flex; gap: 10px; flex-wrap: wrap; padding: 12px 20px; }
[data-context-lens-page] .clp-card { min-width: 120px; padding: 8px 12px; border: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.18)); border-radius: 8px; background: var(--dsw-alias-bg-subtle, rgba(127,127,127,.05)); }
[data-context-lens-page] .clp-cardLabel { display: block; color: var(--dsw-alias-label-tertiary, inherit); font-size: 11px; }
[data-context-lens-page] .clp-cardValue { display: block; font-size: 18px; font-weight: 500; font-variant-numeric: tabular-nums; }
[data-context-lens-page] .clp-body { flex: 1; min-height: 0; padding: 0 20px 24px; overflow: auto; }
[data-context-lens-page] .clp-turn { margin-top: 14px; }
[data-context-lens-page] .clp-turnHead { margin: 0 0 8px; padding-bottom: 6px; border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.16)); font-size: 14px; font-weight: 500; }
[data-context-lens-page] .clp-step { margin-bottom: 10px; border: 1px solid var(--dsw-alias-border-l1, rgba(127,127,127,.2)); border-radius: 10px; background: var(--dsw-alias-bg-subtle, rgba(127,127,127,.04)); overflow: hidden; }
[data-context-lens-page] .clp-stepHead { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 12px; }
[data-context-lens-page] .clp-stepLabel { font-weight: 500; }
[data-context-lens-page] .clp-metric { color: var(--dsw-alias-label-secondary, inherit); font-variant-numeric: tabular-nums; }
[data-context-lens-page] .clp-metric[data-tone='warn'] { color: var(--dsw-alias-state-warning-primary, #b7791f); }
[data-context-lens-page] .clp-bar { height: 4px; margin: 0 12px 8px; border-radius: 999px; background: var(--dsw-alias-interactive-bg, rgba(127,127,127,.12)); overflow: hidden; }
[data-context-lens-page] .clp-barFill { height: 100%; border-radius: inherit; background: var(--dsw-alias-interactive-accent, #4c8bf5); }
[data-context-lens-page] .clp-folds { padding: 0 12px 10px; }
[data-context-lens-page] .clp-fold + .clp-fold { margin-top: 4px; }
[data-context-lens-page] .clp-foldHead { display: flex; align-items: center; gap: 8px; width: 100%; min-height: 28px; padding: 2px 6px; border: 0; border-radius: 6px; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
[data-context-lens-page] .clp-foldHead:hover { background: var(--dsw-alias-interactive-bg-hover, rgba(127,127,127,.1)); }
[data-context-lens-page] .clp-foldHead:focus-visible { outline: 2px solid var(--dsw-alias-interactive-accent, #4c8bf5); outline-offset: -2px; }
[data-context-lens-page] .clp-glyph { flex: none; width: 18px; text-align: center; color: var(--dsw-alias-label-tertiary, inherit); }
[data-context-lens-page] .clp-foldTitle { flex: none; font-weight: 500; }
[data-context-lens-page] .clp-preview { min-width: 0; flex: 1; color: var(--dsw-alias-label-tertiary, inherit); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
[data-context-lens-page] .clp-chevron { flex: none; color: var(--dsw-alias-label-tertiary, inherit); }
[data-context-lens-page] .clp-foldBody { padding: 4px 4px 8px 26px; }
[data-context-lens-page] .clp-text { max-height: 260px; margin: 0; padding: 8px 10px; border-radius: 8px; background: var(--dsw-alias-interactive-bg, rgba(127,127,127,.07)); font: inherit; white-space: pre-wrap; overflow-wrap: anywhere; overflow: auto; }
[data-context-lens-page] .clp-hint { color: var(--dsw-alias-state-warning-primary, #b7791f); font-size: 12px; }
[data-context-lens-page] .clp-empty { color: var(--dsw-alias-label-tertiary, inherit); }
[data-context-lens-page] .clp-entry { margin-top: 4px; padding: 5px 8px; border-left: 2px solid var(--dsw-alias-border-l2, rgba(127,127,127,.3)); }
[data-context-lens-page] .clp-entry[data-role='assistant'] { border-left-color: var(--dsw-alias-interactive-accent, #4c8bf5); }
[data-context-lens-page] .clp-entry[data-role='tool'] { border-left-color: var(--dsw-alias-state-warning-primary, #b7791f); }
[data-context-lens-page] .clp-entryHead { color: var(--dsw-alias-label-secondary, inherit); font-size: 11px; }
[data-context-lens-page] .clp-entryText { max-height: 110px; overflow: auto; white-space: pre-wrap; overflow-wrap: anywhere; }
[data-context-lens-page] .clp-blank { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; gap: 6px; color: var(--dsw-alias-label-tertiary, inherit); }
[data-context-lens-page] .clp-blankGlyph { font-size: 28px; }
`,
        },
      },
    }
  },
  factory(require) {
    const React = require('react')
    const { createElement: h, useCallback, useEffect, useMemo, useState } = React
    let Icon = null
    try {
      const primitives = require('@deepseek-ai/dsh-client-ui-primitives')
      Icon = primitives.IconDataOutlineMedium ?? primitives.IconDataOutlineRegular ?? null
    } catch {
      Icon = null
    }

    %%ANALYSIS%%

    const PANEL_ID = 'context-lens'
    const NS = 'contextLens'
    const zh = {
      panel: '缓存分析',
      title: '上下文缓存分析',
      selectSession: '选择会话',
      range: '对比范围',
      previous: '上一轮',
      recent: '前 3 轮',
      all: '全部历史',
      turns: '轮次',
      average: '平均重合率',
      maxReplay: '最多重注入',
      totalNew: '累计新增',
      overlap: '重合',
      added: '新增',
      replay: '思考重注入',
      contextDiff: '上下文差异',
      reasoning: '思考过程',
      response: '正式输出',
      tools: '工具调用',
      noSession: '请选择一个会话',
      blank: '该会话还没有可分析的输出',
      blankHint: '发起一轮对话后，这里会按轮次显示上下文比对与可折叠的思考/输出。',
      replayHint: '此前轮次的思考内容再次进入本次请求',
      noAdded: '没有新增上下文',
      noRemoved: '没有移除上下文',
      emptyReasoning: '本轮没有思考内容',
      emptyResponse: '本轮没有正式输出',
      emptyTools: '本轮没有工具调用',
      items: '{count} 条',
      turn: '第 {turn} 轮',
      step: '第 {step} 步',
    }
    const en = {
      panel: 'Cache analysis',
      title: 'Context cache analysis',
      selectSession: 'Select session',
      range: 'Compare with',
      previous: 'Previous turn',
      recent: 'Last 3 turns',
      all: 'All history',
      turns: 'Turns',
      average: 'Average overlap',
      maxReplay: 'Most replayed',
      totalNew: 'Total added',
      overlap: 'Overlap',
      added: 'Added',
      replay: 'Reasoning replay',
      contextDiff: 'Context differences',
      reasoning: 'Reasoning',
      response: 'Response',
      tools: 'Tool calls',
      noSession: 'Select a session',
      blank: 'No output to analyze yet',
      blankHint: 'After a turn completes, context comparisons and collapsible reasoning/response appear here.',
      replayHint: 'Reasoning from an earlier turn entered this request again',
      noAdded: 'No context added',
      noRemoved: 'No context removed',
      emptyReasoning: 'No reasoning in this step',
      emptyResponse: 'No response in this step',
      emptyTools: 'No tool calls in this step',
      items: '{count} items',
      turn: 'Turn {turn}',
      step: 'Step {step}',
    }

    const EMPTY = { steps: [], outputs: [], comparisons: [], surface: [] }
    const RANGES = [['previous', 'previous'], ['recent', 'recent'], ['all', 'all']]

    function Fold({ glyph, title, preview, open, onToggle, children }) {
      return h('div', { className: 'clp-fold' },
        h('button', { type: 'button', className: 'clp-foldHead', 'aria-expanded': open, onClick: onToggle },
          h('span', { className: 'clp-glyph', 'aria-hidden': 'true' }, glyph),
          h('span', { className: 'clp-foldTitle' }, title),
          preview ? h('span', { className: 'clp-preview' }, preview) : null,
          h('span', { className: 'clp-chevron', 'aria-hidden': 'true' }, open ? '▾' : '▸'),
        ),
        open ? h('div', { className: 'clp-foldBody' }, children) : null,
      )
    }

    function ItemList({ items, t, missing }) {
      if (items.length === 0) return h('p', { className: 'clp-empty' }, t(missing))
      return items.map((item, index) => h('div', {
        className: 'clp-entry', key: `${item.role}-${index}`, 'data-role': item.role,
      },
        h('div', { className: 'clp-entryHead' }, item.role),
        h('div', { className: 'clp-entryText' }, item.text || item.reasoning),
      ))
    }

    function PanelIcon({ size }) {
      return Icon === null
        ? h('span', { 'aria-hidden': 'true' }, '▤')
        : h(Icon, { size })
    }

    function LensPage({ t, useSessions, watch, snapshotOf }) {
      const list = useSessions(state => state)
      const [selected, setSelected] = useState('')
      const [range, setRange] = useState('recent')
      const [snapshot, setSnapshot] = useState(EMPTY)
      const [open, setOpen] = useState({})

      useEffect(() => {
        if (selected !== '') return
        const active = list.ids.find(id => (list.byId[id]?.retainedBy?.mainView ?? 0) > 0)
        if (active !== undefined) setSelected(String(active))
      }, [list, selected])

      useEffect(() => {
        if (selected === '') {
          setSnapshot(EMPTY)
          return undefined
        }
        setSnapshot(snapshotOf(selected))
        return watch(selected, () => setSnapshot(snapshotOf(selected)))
      }, [selected, watch, snapshotOf])

      const toggle = useCallback(key => () => {
        setOpen(previous => ({ ...previous, [key]: !previous[key] }))
      }, [])

      const analysis = snapshot
      const groups = useMemo(() => {
        const byTurn = new Map()
        for (const output of analysis.outputs) {
          const key = output.turn
          const listOfTurn = byTurn.get(key) ?? []
          listOfTurn.push(output)
          byTurn.set(key, listOfTurn)
        }
        return [...byTurn.entries()].sort((a, b) => a[0] - b[0])
      }, [analysis])

      const totals = useMemo(() => {
        const ratios = []
        let replayMax = 0
        let added = 0
        for (const output of analysis.outputs) {
          const comparison = comparisonFor(analysis, output.turn, output.step, range)
          if (comparison === null) continue
          ratios.push(comparison.overlapRatio)
          replayMax = Math.max(replayMax, comparison.replayedReasoning.length)
          added += comparison.newCount
        }
        return {
          average: ratios.length === 0 ? 0 : Math.round(ratios.reduce((a, b) => a + b, 0) / ratios.length * 100),
          replayMax,
          added,
        }
      }, [analysis, range])

      const options = list.ids.map(id => h('option', {
        key: id, value: String(id),
      }, list.byId[id]?.displayTitle ?? String(id)))

      return h('div', { className: 'clp-root', 'data-context-lens-page': '' },
        h('header', { className: 'clp-top' },
          h('h1', { className: 'clp-title' }, t('title')),
          h('label', { className: 'clp-control' },
            t('selectSession'),
            h('select', {
              value: selected,
              onChange: event => setSelected(event.target.value),
            },
              h('option', { value: '' }, t('noSession')),
              options,
            ),
          ),
          h('label', { className: 'clp-control' },
            t('range'),
            h('select', {
              value: range,
              onChange: event => setRange(event.target.value),
            }, RANGES.map(([key, label]) => h('option', { key, value: key }, t(label)))),
          ),
        ),
        h('div', { className: 'clp-summary' },
          h('div', { className: 'clp-card' },
            h('span', { className: 'clp-cardLabel' }, t('turns')),
            h('span', { className: 'clp-cardValue' }, groups.length),
          ),
          h('div', { className: 'clp-card' },
            h('span', { className: 'clp-cardLabel' }, t('average')),
            h('span', { className: 'clp-cardValue' }, `${totals.average}%`),
          ),
          h('div', { className: 'clp-card' },
            h('span', { className: 'clp-cardLabel' }, t('totalNew')),
            h('span', { className: 'clp-cardValue' }, totals.added),
          ),
          h('div', { className: 'clp-card' },
            h('span', { className: 'clp-cardLabel' }, t('maxReplay')),
            h('span', { className: 'clp-cardValue' }, totals.replayMax),
          ),
        ),
        groups.length === 0
          ? h('div', { className: 'clp-blank' },
            h('span', { className: 'clp-blankGlyph', 'aria-hidden': 'true' }, '▤'),
            h('strong', {}, selected === '' ? t('noSession') : t('blank')),
            h('span', {}, selected === '' ? '' : t('blankHint')),
          )
          : h('div', { className: 'clp-body' }, groups.map(([turn, outputs]) => h('section', {
            className: 'clp-turn', key: turn, 'data-turn': turn,
          },
            h('h2', { className: 'clp-turnHead' }, t('turn', { turn })),
            outputs.map(output => {
              const key = `${turn}-${output.step}`
              const comparison = comparisonFor(analysis, turn, output.step, range)
              const ratio = Math.round((comparison?.overlapRatio ?? 0) * 100)
              const replay = comparison?.replayedReasoning?.length ?? 0
              const preview = text => text.length > 64 ? `${text.slice(0, 64)}…` : text
              return h('article', { className: 'clp-step', key },
                h('div', { className: 'clp-stepHead' },
                  h('span', { className: 'clp-stepLabel' }, t('step', { step: output.step })),
                  h('span', { className: 'clp-metric' }, `${t('overlap')} ${ratio}%`),
                  h('span', { className: 'clp-metric' }, `${t('added')} ${comparison?.newCount ?? 0}`),
                  h('span', { className: 'clp-metric', 'data-tone': replay > 0 ? 'warn' : undefined },
                    `${t('replay')} ${replay}`),
                ),
                h('div', { className: 'clp-bar', 'aria-hidden': 'true' },
                  h('div', { className: 'clp-barFill', style: { width: `${ratio}%` } }),
                ),
                h('div', { className: 'clp-folds' },
                  h(Fold, {
                    glyph: '≷', title: t('contextDiff'),
                    preview: comparison === null ? '' : `${comparison.added.length} + / ${comparison.removed.length} −`,
                    open: open[`${key}-diff`] === true, onToggle: toggle(`${key}-diff`),
                  },
                    comparison === null ? null : h('div', {},
                      replay > 0 ? h('p', { className: 'clp-hint' }, t('replayHint')) : null,
                      h(ItemList, { items: comparison.added, t, missing: 'noAdded' }),
                      h(ItemList, { items: comparison.removed, t, missing: 'noRemoved' }),
                    ),
                  ),
                  h(Fold, {
                    glyph: '◌', title: t('reasoning'), preview: preview(output.reasoning),
                    open: open[`${key}-reasoning`] === true, onToggle: toggle(`${key}-reasoning`),
                  }, output.reasoning
                    ? h('pre', { className: 'clp-text' }, output.reasoning)
                    : h('p', { className: 'clp-empty' }, t('emptyReasoning'))),
                  h(Fold, {
                    glyph: '✓', title: t('response'), preview: preview(output.response),
                    open: open[`${key}-response`] === true, onToggle: toggle(`${key}-response`),
                  }, output.response
                    ? h('pre', { className: 'clp-text' }, output.response)
                    : h('p', { className: 'clp-empty' }, t('emptyResponse'))),
                  h(Fold, {
                    glyph: '⌘', title: t('tools'), preview: t('items', { count: output.tools.length }),
                    open: open[`${key}-tools`] === true, onToggle: toggle(`${key}-tools`),
                  }, output.tools.length === 0
                    ? h('p', { className: 'clp-empty' }, t('emptyTools'))
                    : output.tools.map(tool => h('div', { className: 'clp-entry', key: tool.callId },
                      h('div', { className: 'clp-entryHead' }, tool.name),
                      h('div', { className: 'clp-entryText' }, tool.arguments),
                    ))),
                ),
              )
            }),
          ))),
      )
    }

    return {
      inject: ['slots', 'locale', 'sessions', 'layout'],
      apply(ctx) {
        const t = ctx.locale.bind(NS)
        ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'context-lens: dictionaries')

        const analyzers = new Map()
        const analyzerFor = (sessionId) => {
          if (sessionId === '' || sessionId === null || sessionId === undefined) return null
          if (analyzers.has(sessionId)) return analyzers.get(sessionId)
          const reference = ctx.sessions.retain(sessionId, { source: 'contextLens' })
          const eventSource = reference.binding.eventSource
          const entry = {
            reference,
            eventSource,
            listeners: new Set(),
            snapshot: EMPTY,
            revision: -1,
            unsubscribe: null,
          }
          entry.recompute = () => {
            const window = eventSource.getSnapshot()
            if (window.revision === entry.revision) return
            entry.revision = window.revision
            entry.snapshot = analyzeEvents(window.entries)
            for (const listener of entry.listeners) listener()
          }
          analyzers.set(sessionId, entry)
          return entry
        }
        const watch = (sessionId, listener) => {
          const entry = analyzerFor(sessionId)
          if (entry === null) return () => {}
          entry.listeners.add(listener)
          if (entry.listeners.size === 1) {
            entry.unsubscribe = entry.eventSource.subscribe(entry.recompute)
            entry.recompute()
          }
          return () => {
            entry.listeners.delete(listener)
            if (entry.listeners.size !== 0) return
            if (entry.unsubscribe !== null) entry.unsubscribe()
            entry.reference.release()
            analyzers.delete(sessionId)
          }
        }
        const snapshotOf = sessionId => analyzers.get(sessionId)?.snapshot ?? EMPTY

        ctx.effect(() => () => {
          for (const entry of analyzers.values()) {
            if (entry.unsubscribe !== null) entry.unsubscribe()
            entry.reference.release()
          }
          analyzers.clear()
        }, 'context-lens: session analyzers')

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: PANEL_ID,
          order: 20,
          locale: NS,
          label: () => t('panel'),
        }, PanelIcon))

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: PANEL_ID,
          locale: NS,
          inject: () => ({ watch, snapshotOf }),
        }, LensPage))
      },
    }
  },
})
