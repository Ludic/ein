import type { ComponentType } from './component'
import type { Engine } from './engine'
import type { Entity } from './entity'
import { Emitter } from './events'

/** A component class or a tag name. */
export type QueryTerm = ComponentType | string

export interface QueryOptions<A extends readonly QueryTerm[] = readonly QueryTerm[]> {
  /** Entities must have every one of these. Determines the entity type of the query. */
  all?: A
  /** Entities must have at least one of these. */
  any?: readonly QueryTerm[]
  /** Entities must have none of these. */
  none?: readonly QueryTerm[]
}

type InstanceOf<C> = C extends ComponentType<infer T> ? T : never
/** The union of component instance types named by an `all` list. */
export type QueryComponents<A extends readonly QueryTerm[]> = InstanceOf<A[number]>

export type QueryEvent = 'added' | 'removed' | 'updated'
export type QueryEvents<T extends object> = {
  added: [entity: Entity<T>]
  removed: [entity: Entity<T>]
  updated: []
}

/**
 * A live set of entities matching component terms. Membership is updated when
 * the engine flushes (at the start of every `update()`), not when components change.
 * `entities` is unordered: removal swaps the last entity into the removed slot.
 */
export class Query<T extends object = never> implements Iterable<Entity<T>> {
  readonly engine: Engine
  readonly entities: Entity<T>[] = []
  /** Entities that joined since the last frame the systems processed. */
  readonly added: Entity<T>[] = []
  /** Entities that left since the last frame the systems processed. */
  readonly removed: Entity<T>[] = []

  private readonly allIds: number[]
  private readonly anyIds: number[]
  private readonly noneIds: number[]
  private all!: Uint32Array
  private any!: Uint32Array
  private none!: Uint32Array
  private readonly events = new Emitter<QueryEvents<T>>()
  private positions = new Int32Array(0)
  private addedSeen: number = 0
  private removedSeen: number = 0
  private changed: boolean = false
  private disposed: boolean = false

  constructor(engine: Engine, options: QueryOptions) {
    this.engine = engine
    const ids = (terms: readonly QueryTerm[] | undefined): number[] =>
      (terms ?? []).map(
        (term) =>
          engine.components.store(typeof term === 'string' ? engine.components.tag(term) : term)
            .info.id,
      )
    this.allIds = ids(options.all)
    this.anyIds = ids(options.any)
    this.noneIds = ids(options.none)
    this._rebuildMasks()
  }

  get size(): number {
    return this.entities.length
  }

  get first(): Entity<T> | undefined {
    return this.entities[0]
  }

  get isDisposed(): boolean {
    return this.disposed
  }

  [Symbol.iterator](): IterableIterator<Entity<T>> {
    return this.entities[Symbol.iterator]()
  }

  has(entity: Entity): boolean {
    return entity.index < this.positions.length && this.positions[entity.index]! >= 0
  }

  /** Whether an entity's current components match, regardless of flush state. */
  matches(entity: Entity): boolean {
    return (
      entity.alive &&
      this.engine.masks.matches(
        entity.index,
        this.all,
        this.any,
        this.none,
        this.anyIds.length === 0,
      )
    )
  }

  on<E extends QueryEvent>(event: E, listener: (...args: QueryEvents<T>[E]) => void): () => void {
    return this.events.on(event, listener)
  }

  off<E extends QueryEvent>(event: E, listener: (...args: QueryEvents<T>[E]) => void): void {
    this.events.off(event, listener)
  }

  /** Stop tracking entities and detach from the engine. */
  dispose(): void {
    if (this.disposed) return
    this.disposed = true
    this.engine.queries._remove(this)
    this.entities.length = 0
    this.added.length = 0
    this.removed.length = 0
    this.positions = new Int32Array(0)
    this.events.clear()
  }

  /** @internal */
  _evaluate(entity: Entity): void {
    const slot = entity.index
    const present = this.has(entity)
    const match = this.matches(entity)
    if (match && !present) {
      this.ensure(slot)
      this.positions[slot] = this.entities.length
      this.entities.push(entity as Entity<T>)
      this.added.push(entity as Entity<T>)
      this.changed = true
      this.events.emit('added', entity as Entity<T>)
    } else if (!match && present) {
      const pos = this.positions[slot]!
      const last = this.entities.pop()!
      if (last !== entity) {
        this.entities[pos] = last
        this.positions[last.index] = pos
      }
      this.positions[slot] = -1
      this.removed.push(entity as Entity<T>)
      this.changed = true
      this.events.emit('removed', entity as Entity<T>)
    }
  }

  /** @internal */
  _finishFlush(): void {
    if (!this.changed) return
    this.changed = false
    this.events.emit('updated')
  }

  /** @internal Drop the diff entries the previous frame already processed. */
  _beginFrame(): void {
    if (this.addedSeen > 0) {
      this.added.splice(0, this.addedSeen)
      this.addedSeen = 0
    }
    if (this.removedSeen > 0) {
      this.removed.splice(0, this.removedSeen)
      this.removedSeen = 0
    }
  }

  /** @internal */
  _endFrame(): void {
    this.addedSeen = this.added.length
    this.removedSeen = this.removed.length
  }

  /** @internal */
  _rebuildMasks(): void {
    const masks = this.engine.masks
    this.all = masks.build(this.allIds)
    this.any = masks.build(this.anyIds)
    this.none = masks.build(this.noneIds)
  }

  private ensure(slot: number): void {
    if (slot < this.positions.length) return
    const next = new Int32Array(Math.max(slot + 1, this.positions.length * 2, 64))
    next.fill(-1)
    next.set(this.positions)
    this.positions = next
  }
}

export class QueryManager implements Iterable<Query> {
  readonly engine: Engine
  private readonly queries = new Set<Query>()
  private readonly dirty = new Set<Entity>()

  constructor(engine: Engine) {
    this.engine = engine
  }

  create<const A extends readonly QueryTerm[] = readonly []>(
    options: QueryOptions<A>,
  ): Query<QueryComponents<A>> {
    const query = new Query<QueryComponents<A>>(this.engine, options)
    this.queries.add(query)
    this.engine.events.emit('query:created', query)
    return query
  }

  get size(): number {
    return this.queries.size
  }

  [Symbol.iterator](): IterableIterator<Query> {
    return this.queries.values()
  }

  /** Entities whose components changed since the last flush. */
  get pending(): number {
    return this.dirty.size
  }

  /** @internal */
  _remove(query: Query): void {
    if (this.queries.delete(query)) this.engine.events.emit('query:disposed', query)
  }

  /** @internal */
  _markDirty(entity: Entity): void {
    this.dirty.add(entity)
  }

  /** @internal */
  _flush(): boolean {
    if (this.dirty.size === 0) return false
    for (const entity of this.dirty) {
      for (const query of this.queries) query._evaluate(entity)
    }
    this.dirty.clear()
    for (const query of this.queries) query._finishFlush()
    return true
  }

  /** @internal */
  _beginFrame(): void {
    for (const query of this.queries) query._beginFrame()
  }

  /** @internal */
  _endFrame(): void {
    for (const query of this.queries) query._endFrame()
  }

  /** @internal */
  _rebuildMasks(): void {
    for (const query of this.queries) query._rebuildMasks()
  }
}
