import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { analyzeEvents } from '../src/analysis.js'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const source = await readFile(join(root, 'client.js'), 'utf8')
assert.ok(source.includes('window.__ModuleLoader__.load'), 'client bundle must use the module loader protocol')
assert.ok(source.includes('function compareContexts'), 'shared analysis must be inlined')
assert.ok(!source.includes('%%ANALYSIS%%'), 'no unresolved placeholder may ship')
assert.ok(source.includes("'sidebar.panellist'"), 'client bundle must register the sidebar entry')
assert.ok(source.includes("'main'"), 'client bundle must register the standalone panel')
assert.ok(!source.includes('conversation.chat.node'), 'analysis must not live inside the chat transcript')

function createElement(type, props, ...children) {
  return { type, props: { ...props, children } }
}

let hookStates = []
let hookIndex = 0
const React = {
  createElement,
  useCallback: callback => callback,
  useEffect: effect => { effect(); return undefined },
  useMemo: factory => factory(),
  useState(initial) {
    const index = hookIndex++
    if (!(index in hookStates)) hookStates[index] = initial
    return [hookStates[index], value => { hookStates[index] = value }]
  },
}

let module = null
globalThis.window = {
  __ModuleLoader__: {
    load: value => { module = value },
  },
}

await import(pathToFileURL(join(root, 'client.js')).href)
assert.equal(module.id, 'dsh-context-lens')
assert.deepEqual(Object.keys(module.meta().stylesheets), ['context-lens.css'])

const plugin = module.factory(name => {
  if (name === 'react') return React
  if (name === '@deepseek-ai/dsh-client-ui-primitives') return { IconDataOutlineMedium: 'icon' }
  throw new Error(`unexpected client dependency: ${name}`)
})
assert.equal(typeof plugin.apply, 'function')
assert.deepEqual(plugin.inject, ['slots', 'locale', 'sessions', 'layout'])

const registrations = []
const ctx = {
  locale: { bind: () => key => key, register: () => () => {} },
  sessions: {
    retain: id => ({
      binding: { eventSource: { getSnapshot: () => ({ revision: 0, entries: [] }), subscribe: () => () => {} } },
      release: () => {},
      sessionId: id,
    }),
  },
  effect: () => () => {},
  slots: {
    inject: (_name, register) => register(),
    register: (meta, component) => { registrations.push({ meta, component }); return () => {} },
  },
}
plugin.apply(ctx)

test('registers a sidebar entry and a standalone main panel', () => {
  const sidebar = registrations.find(entry => entry.meta.name === 'sidebar.panellist')
  const main = registrations.find(entry => entry.meta.name === 'main')
  assert.ok(sidebar !== undefined)
  assert.ok(main !== undefined)
  assert.equal(sidebar.meta.id, 'context-lens')
  assert.equal(sidebar.meta.order, 20)
  assert.equal(sidebar.meta.label(), 'panel')
  assert.equal(main.meta.key, 'context-lens')
  assert.equal(typeof main.meta.inject, 'function')
  assert.deepEqual(Object.keys(main.meta.inject()), ['watch', 'snapshotOf'])
  assert.deepEqual(sidebar.component({ size: 16, active: true }), {
    type: 'icon',
    props: { size: 16, children: [] },
  })
})

function analysisFixture() {
  return analyzeEvents([
    { type: 'event', event: { type: 'step/start', data: { turn: 1, step: 1 }, seq: 1 } },
    { type: 'event', event: { type: 'user/message', data: { content: [{ type: 'text', text: 'first' }] } }, seq: 2 },
    { type: 'event', event: { type: 'step/start', data: { turn: 2, step: 1 }, seq: 3 } },
    {
      type: 'event',
      event: {
        type: 'assistant/message',
        seq: 4,
        data: { turn: 2, step: 1, message: { content: [{ type: 'reasoning', text: 'plan' }, { type: 'text', text: 'a' }] } },
      },
    },
    { type: 'event', event: { type: 'step/start', data: { turn: 3, step: 1 }, seq: 5 } },
    {
      type: 'event',
      event: {
        type: 'assistant/message',
        seq: 6,
        data: { turn: 3, step: 1, message: { content: [{ type: 'reasoning', text: 'plan' }, { type: 'text', text: 'b' }] } },
      },
    },
  ])
}

test('renders turn-grouped folds with a below-100 overlap and replay warning', () => {
  const main = registrations.find(entry => entry.meta.name === 'main')
  hookStates = ['s1', 'recent', analysisFixture(), { '3-1-diff': true }]
  hookIndex = 0
  const face = main.meta.inject()
  const tree = main.component({
    t: key => key,
    useSessions: selector => selector({
      ids: ['s1'],
      byId: { s1: { displayTitle: 'Demo session', retainedBy: { mainView: 1 } } },
    }),
    watch: face.watch,
    snapshotOf: () => hookStates[2],
  })
  const text = JSON.stringify(tree)
  for (const key of ['title', 'selectSession', 'range', 'turns', 'average', 'turn', 'step', 'overlap',
    'added', 'replay', 'contextDiff', 'reasoning', 'response', 'tools', 'replayHint']) {
    assert.ok(text.includes(key), `standalone page should render ${key}`)
  }
  assert.ok(text.includes('overlap 50%'), 'adding new context must produce overlap below 100%')
  assert.ok(text.includes('Demo session'))
  assert.equal(hookIndex, 4)
})
