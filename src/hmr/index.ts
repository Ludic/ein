/**
 * Browser-side hot module replacement runtime. Pair it with the Vite plugin from
 * `@ludic/ein/vite`: the plugin makes modules that define systems and components
 * self-accepting, and on change hands the previous and next module exports to
 * this runtime, which swaps systems and component types in every registered engine.
 */
import type { ComponentType } from '../component'
import type { Engine } from '../engine'
import { System, type SystemClass } from '../system'

export type ModuleExports = Record<string, unknown>

export interface HmrRuntime {
  readonly engines: ReadonlySet<Engine>
  /** Track an engine. Returns a function that stops tracking it. */
  register(engine: Engine): () => void
  /** Compare two versions of a module's exports and swap what changed. Returns the number of swaps. */
  reload(prev: ModuleExports, next: ModuleExports): number
  /** Replace every instance of a system class, keeping priority, order and enabled state. */
  replaceSystem(prev: SystemClass, next: SystemClass): number
  /** Replace a component type in every engine that has it registered. */
  replaceComponent(prev: ComponentType, next: ComponentType): number
}

const GLOBAL_KEY = '__EIN_HMR__'

function isSystemClass(value: unknown): value is SystemClass {
  return typeof value === 'function' && value.prototype instanceof System
}

export function createHmrRuntime(): HmrRuntime {
  const engines = new Set<Engine>()

  const replaceSystem = (prev: SystemClass, next: SystemClass): number => {
    let count = 0
    for (const engine of engines) {
      // Copy first: replacing mutates the list.
      for (const system of Array.from(engine.systems.list)) {
        if (system.constructor !== prev) continue
        const { priority, order, enabled } = system
        engine.removeSystem(system)
        const fresh = engine.addSystem(next, { priority, enabled })
        fresh.order = order
        engine.systems.sort()
        count++
      }
    }
    return count
  }

  const replaceComponent = (prev: ComponentType, next: ComponentType): number => {
    let count = 0
    for (const engine of engines) {
      const before = engine.components.get(prev)
      if (before && engine.components.replace(prev, next) !== before) count++
    }
    return count
  }

  const isRegisteredComponent = (type: unknown): type is ComponentType => {
    if (typeof type !== 'function') return false
    for (const engine of engines) if (engine.components.has(type as ComponentType)) return true
    return false
  }

  return {
    engines,
    register(engine: Engine): () => void {
      engines.add(engine)
      return () => {
        engines.delete(engine)
      }
    },
    reload(prev: ModuleExports, next: ModuleExports): number {
      let count = 0
      for (const key of Object.keys(next)) {
        const before = prev[key]
        const after = next[key]
        if (before === after || typeof before !== 'function' || typeof after !== 'function')
          continue
        if (isSystemClass(before) && isSystemClass(after)) {
          count += replaceSystem(before, after)
        } else if (isRegisteredComponent(before)) {
          count += replaceComponent(before, after as ComponentType)
        }
      }
      return count
    },
    replaceSystem,
    replaceComponent,
  }
}

type GlobalWithRuntime = typeof globalThis & { [GLOBAL_KEY]?: HmrRuntime }

/** The shared runtime the Vite plugin's injected code talks to, created on first use. */
export function getHmrRuntime(): HmrRuntime {
  const global = globalThis as GlobalWithRuntime
  return (global[GLOBAL_KEY] ??= createHmrRuntime())
}

/**
 * Enable hot reloading of systems and components for an engine. Call it once
 * after creating the engine, guarded by `if (import.meta.hot)`.
 * Returns a function that disables it again.
 */
export function installHmr(engine: Engine): () => void {
  return getHmrRuntime().register(engine)
}
