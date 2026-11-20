/**
 * Host half of dsh-context-lens. It observes the exact message list of each
 * model request on `llm/stream` and keeps bounded per-session snapshots for
 * programmatic inspection; the Web half replays the same comparison from
 * durable Session events for display.
 */
import { summarizeMessages, compareContexts } from './src/analysis.js'

export const name = 'context-lens'
export const inject = []

const LIMIT = 200
const histories = new Map()

/** Programmatic read of the captured request comparisons for one Session id. */
export function historyOf(sessionId) {
  const history = histories.get(String(sessionId)) ?? []
  return history.map(entry => entry.record)
}

export function apply(ctx) {
  ctx.on('llm/stream', (options, next) => {
    if (options.sessionId !== undefined) {
      const key = String(options.sessionId)
      const items = summarizeMessages(options.messages)
      const history = histories.get(key) ?? []
      history.push({
        items,
        record: {
          time: Date.now(),
          model: options.model,
          provider: options.provider,
          comparison: compareContexts(history.at(-1)?.items ?? [], items, {
            at: Date.now(),
            model: options.model,
          }),
        },
      })
      if (history.length > LIMIT) history.shift()
      histories.set(key, history)
    }
    return next()
  }, { global: true })

  ctx.effect(() => () => histories.clear(), 'context-lens: request snapshots')
}
