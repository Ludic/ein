import type { Engine } from './engine'
import { Entity } from './entity'

export class EntityManager implements Iterable<Entity> {
  readonly engine: Engine

  private readonly byId = new Map<number, Entity>()
  private readonly bySlot: Array<Entity | undefined> = []
  private readonly freeSlots: number[] = []
  private readonly pendingDestroy: Entity[] = []
  private nextId: number = 0
  private nextSlot: number = 0

  constructor(engine: Engine) {
    this.engine = engine
  }

  /** Live entities, including those destroyed but not yet flushed. */
  get size(): number {
    return this.byId.size
  }

  /** Number of storage slots ever handed out. */
  get capacity(): number {
    return this.nextSlot
  }

  create(name: string = ''): Entity {
    const slot = this.freeSlots.pop() ?? this.nextSlot++
    this.engine.masks.ensureSlots(slot + 1)
    const entity = new Entity(this.engine, this.nextId++, slot, name)
    this.byId.set(entity.id, entity)
    this.bySlot[slot] = entity
    this.engine.queries._markDirty(entity)
    this.engine.events.emit('entity:created', entity)
    return entity
  }

  /** Mark an entity dead. Its components and slot are released on the next flush. */
  destroy(entity: Entity): void {
    if (!entity._alive) return
    entity._alive = false
    this.pendingDestroy.push(entity)
    this.engine.queries._markDirty(entity)
  }

  get(id: number): Entity | undefined {
    return this.byId.get(id)
  }

  /** The entity occupying a storage slot. */
  at(slot: number): Entity | undefined {
    return this.bySlot[slot]
  }

  has(entity: Entity): boolean {
    return this.byId.get(entity.id) === entity
  }

  [Symbol.iterator](): IterableIterator<Entity> {
    return this.byId.values()
  }

  toArray(): Entity[] {
    return [...this.byId.values()]
  }

  /** @internal */
  _releasePending(): void {
    if (this.pendingDestroy.length === 0) return
    const { masks, components, events } = this.engine
    for (const entity of this.pendingDestroy) {
      for (const id of masks.bits(entity.index)) {
        const store = components._storeById(id)
        if (store) {
          store.detach(entity.index)
          components._markPending(store)
        }
      }
      masks.reset(entity.index)
      this.byId.delete(entity.id)
      this.bySlot[entity.index] = undefined
      this.freeSlots.push(entity.index)
      events.emit('entity:destroyed', entity)
    }
    this.pendingDestroy.length = 0
  }
}
