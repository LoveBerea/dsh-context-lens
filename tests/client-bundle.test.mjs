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

function createElement(type, props, ...children) {
  return { type, props: { ...props, children } }
}

const React = {
  createElement,
  useCallback: callback => callback,
  useState: initial => [initial, () => {}],
  useSyncExternalStore: () => null,
}

let module = null
globalThis.window = {
  __ModuleLoader__: {
    load: value => { module = value },
  },
}

await import(pathToFileURL(join(root, 'client.js')).href)
assert.equal(module.id, 'dsh-context-lens')
assert.deepEqual(module.meta().stylesheets ? Object.keys(module.meta().stylesheets) : [], ['context-lens.css'])

const plugin = module.factory(name => {
  if (name === 'react') return React
  throw new Error(`unexpected client dependency: ${name}`)
})
assert.equal(typeof plugin.apply, 'function')
assert.deepEqual(plugin.inject, ['uiConversation', 'sessions', 'slots', 'locale'])

test('registers one collapsible analysis node definition and renderer', () => {
  const definitions = []
  const registrations = []
  const ctx = {
    uiConversation: { events: { register: definition => definitions.push(definition) } },
    sessions: { binding: () => undefined },
    locale: { register: () => () => {} },
    effect: () => () => {},
    slots: {
      inject: (_name, register) => register(),
      register: (meta, component) => { registrations.push({ meta, component }); return () => {} },
    },
  }
  plugin.apply(ctx)

  assert.equal(definitions.length, 1)
  assert.equal(definitions[0].kind, 'context-lens-turn')
  assert.equal(registrations.length, 1)
  assert.equal(registrations[0].meta.key, 'context-lens-turn')
  assert.equal(registrations[0].meta.name, 'conversation.chat.node')

  const match = definitions[0].match({
    type: 'assistant/message',
    data: { turn: 3, step: 1, message: { content: [] } },
  })
  assert.deepEqual(match, { id: 'context-lens-3-1', role: 'start' })
  assert.equal(definitions[0].match({ type: 'user/message', data: {} }), null)

  const state = definitions[0].start({}, {
    event: {
      type: 'assistant/message',
      data: {
        turn: 3,
        step: 1,
        message: { content: [{ type: 'reasoning', text: 'why' }, { type: 'text', text: 'answer' }] },
      },
    },
  })
  const node = definitions[0].buildViewNode({ key: 'k', id: 'context-lens-3-1', state })
  assert.equal(node.kind, 'context-lens-turn')
  assert.deepEqual(node.data.reasoning, 'why')
  assert.deepEqual(node.data.response, 'answer')
})

test('renders grouped folds with context comparison statistics', () => {
  let component = null
  const ctx = {
    uiConversation: { events: { register: () => {} } },
    sessions: { binding: () => undefined },
    locale: { register: () => () => {} },
    effect: () => () => {},
    slots: {
      inject: (_name, register) => register(),
      register: (_meta, view) => { component = view; return () => {} },
    },
  }
  plugin.apply(ctx)

  const analysis = analyzeEvents([
    { type: 'event', event: { type: 'step/start', data: { turn: 1, step: 1 }, seq: 1 } },
    {
      type: 'event',
      event: {
        type: 'assistant/message',
        seq: 2,
        data: { turn: 1, step: 1, message: { content: [{ type: 'reasoning', text: 'plan' }, { type: 'text', text: 'hi' }] } },
      },
    },
    { type: 'event', event: { type: 'step/start', data: { turn: 2, step: 1 }, seq: 3 } },
    {
      type: 'event',
      event: {
        type: 'assistant/message',
        seq: 4,
        data: { turn: 2, step: 1, message: { content: [{ type: 'reasoning', text: 'plan' }, { type: 'text', text: 'next' }] } },
      },
    },
    { type: 'event', event: { type: 'step/start', data: { turn: 3, step: 1 }, seq: 5 } },
    {
      type: 'event',
      event: {
        type: 'assistant/message',
        seq: 6,
        data: { turn: 3, step: 1, message: { content: [{ type: 'reasoning', text: 'plan' }, { type: 'text', text: 'done' }] } },
      },
    },
  ])

  const tree = component({
    node: { data: { turn: 3, step: 1, reasoning: 'plan', response: 'done' } },
    t: key => key,
    useLens: () => analysis,
  })
  const text = JSON.stringify(tree)
  for (const key of ['title', 'turn', 'step', 'prefix', 'overlap', 'added', 'removed', 'replay',
    'contextDiff', 'reasoning', 'response', 'tools']) {
    assert.ok(text.includes(key), `rendered view should contain ${key}`)
  }
  assert.ok(text.includes('replayHint'), 'repeated reasoning must be called out')
})
