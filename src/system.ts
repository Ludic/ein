import type { Engine } from './engine'
import type { Query, QueryComponents, QueryOptions, QueryTerm } from './query'

export interface SystemOptions {
  /** Lower runs first. Defaults to the system's own `priority` field. */
  priority?: number
  enabled?: boolean
}

export type SystemClass<S extends System = System> = new () => S
export type SystemFn = (delta: number, time: number) => void

interface SystemTimer {
  end: number
  handler: () => void
}

/**
 * Base class for systems. Override `update()`; use `query()`, `setTimeout()` and
 * `onDispose()` for resources that must go away when the system is removed.
 */
export class System {
  /** Lower runs first. Systems with equal priority run in insertion order. */
  priority: number = 0
  /** Insertion order, assigned by the engine. */
  order: number = 0
  enabled: boolean = true
  /** Set before `onAdded()` is called. */
  engine!: Engine

  private readonly timers = new Set<SystemTimer>()
  private readonly disposers: Array<() => void> = []

  update(_delta: number, _time: number): void {}

  /** Called after the system is added. Create queries and resources here. */
  onAdded(_engine: Engine): void {}

  /** Called before resources registered with `onDispose()` are released. */
  onRemoved(): void {}

  shouldUpdate(): boolean {
    return this.enabled
  }

  /** Create a query that is disposed with the system. */
  protected query<const A extends readonly QueryTerm[] = readonly []>(
    options: QueryOptions<A>,
  ): Query<QueryComponents<A>> {
    const query = this.engine.createQuery(options)
    this.onDispose(() => query.dispose())
    return query
  }

  /** Register cleanup that runs when the system is removed. */
  protected onDispose(fn: () => void): void {
    this.disposers.push(fn)
  }

  /** Run `handler` once engine time has advanced by `duration`. Returns a cancel function. */
  protected setTimeout(handler: () => void, duration: number): () => boolean {
    const timer: SystemTimer = { handler, end: this.engine.time + duration }
    this.timers.add(timer)
    return () => this.timers.delete(timer)
  }

  /** @internal */
  _tick(time: number): void {
    if (this.timers.size === 0) return
    for (const timer of this.timers) {
      if (time >= timer.end) {
        this.timers.delete(timer)
        timer.handler()
      }
    }
  }

  /** @internal */
  _dispose(): void {
    this.onRemoved()
    for (let i = this.disposers.length - 1; i >= 0; i--) this.disposers[i]!()
    this.disposers.length = 0
    this.timers.clear()
  }
}

/** Wraps a plain function as a system. */
export class FunctionSystem extends System {
  readonly fn: SystemFn

  constructor(fn: SystemFn) {
    super()
    this.fn = fn
  }

  override update(delta: number, time: number): void {
    this.fn(delta, time)
  }
}

export class SystemManager implements Iterable<System> {
  readonly engine: Engine
  /** Systems in execution order. */
  readonly list: System[] = []
  private nextOrder: number = 0

  constructor(engine: Engine) {
    this.engine = engine
  }

  add<S extends System>(system: S | SystemClass<S>, options?: SystemOptions): S
  add(system: SystemFn, options?: SystemOptions): FunctionSystem
  add(system: System | SystemClass | SystemFn, options: SystemOptions = {}): System {
    const instance = resolveSystem(system)
    if (this.list.includes(instance)) throw new Error('ein: system already added')
    if (options.priority !== undefined) instance.priority = options.priority
    if (options.enabled !== undefined) instance.enabled = options.enabled
    instance.order = this.nextOrder++
    instance.engine = this.engine
    instance.onAdded(this.engine)
    this.list.push(instance)
    this.sort()
    this.engine.events.emit('system:added', instance)
    return instance
  }

  remove(system: System): boolean {
    const index = this.list.indexOf(system)
    if (index === -1) return false
    this.list.splice(index, 1)
    system._dispose()
    this.engine.events.emit('system:removed', system)
    return true
  }

  /** The first system that is an instance of `type`. */
  get<S extends System>(type: abstract new (...args: never[]) => S): S | undefined {
    return this.list.find((system): system is S => system instanceof type)
  }

  has(system: System): boolean {
    return this.list.includes(system)
  }

  get size(): number {
    return this.list.length
  }

  [Symbol.iterator](): IterableIterator<System> {
    return this.list[Symbol.iterator]()
  }

  /** Re-sort after changing a system's `priority`. */
  sort(): void {
    this.list.sort((a, b) => a.priority - b.priority || a.order - b.order)
  }
}

function resolveSystem(system: System | SystemClass | SystemFn): System {
  if (system instanceof System) return system
  if (isSystemClass(system)) return new system()
  return new FunctionSystem(system)
}

function isSystemClass(value: SystemClass | SystemFn): value is SystemClass {
  return typeof value === 'function' && value.prototype instanceof System
}
