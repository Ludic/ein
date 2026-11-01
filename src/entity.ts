import type { ComponentSnapshot, ComponentType } from './component'
import { serializeComponent } from './component'
import type { Engine } from './engine'
import type { ComponentData } from './types'

export interface EntitySnapshot {
  id: number
  name: string
  tags: string[]
  components: Record<string, ComponentSnapshot>
}

/**
 * A handle to an entity. The type parameter `K` is the union of component types
 * this entity is known to have; `get()` is non-nullable for those. `K` grows
 * through `add()` and the `has()` type guard, and any `Entity<K>` is assignable
 * to a plain `Entity`.
 *
 * A destroyed entity stays readable until the next flush, so listeners can see
 * what is going away. Once the engine has released it the handle is inert: reads
 * return nothing and `remove()` does nothing, even though its storage slot may
 * already belong to a new entity.
 */
export class Entity<K extends object = never> {
  /**
   * Type-level marker that makes `K` contravariant, so `Entity<A | B>` is assignable
   * to `Entity<A>` and to `Entity`, but not the other way round. Never set at runtime.
   */
  declare readonly $known?: (components: K) => void

  readonly id: number
  /** Storage slot. Recycled after destruction, unlike `id`. */
  readonly index: number
  readonly engine: Engine
  name: string
  /** @internal False after `destroy()`. */
  _alive: boolean = true
  /** @internal True once the engine has released the components and the slot. */
  _released: boolean = false

  constructor(engine: Engine, id: number, index: number, name: string) {
    this.engine = engine
    this.id = id
    this.index = index
    this.name = name
  }

  /** False once destroyed. Destroyed entities leave queries on the next flush. */
  get alive(): boolean {
    return this._alive
  }

  /**
   * Add a component, created from the class defaults and `data`.
   * Adding a component the entity already has only assigns `data`.
   */
  add<T extends object>(type: ComponentType<T>, data?: ComponentData<T>): Entity<K | T> {
    if (!this._alive) throw new Error('ein: cannot add a component to a destroyed entity')
    const store = this.engine.components.store(type)
    const existing = store.get(this.index)
    if (existing !== undefined) {
      if (data !== undefined) Object.assign(existing, data)
      return this as unknown as Entity<K | T>
    }
    const instance = store.acquire(data)
    store.attach(this.index, instance)
    this.engine.masks.set(this.index, store.info.id)
    this.engine.queries._markDirty(this)
    this.engine.events.emit('component:added', this, type, instance)
    return this as unknown as Entity<K | T>
  }

  /** Remove a component. The instance stays readable until the next flush. */
  remove<T extends object>(type: ComponentType<T>): Entity<Exclude<K, T>> {
    if (this._released) return this as unknown as Entity<Exclude<K, T>>
    const store = this.engine.components.find(type)
    const instance = store?.detach(this.index)
    if (store && instance !== undefined) {
      this.engine.masks.clear(this.index, store.info.id)
      this.engine.components._markPending(store)
      this.engine.queries._markDirty(this)
      this.engine.events.emit('component:removed', this, type, instance)
    }
    return this as unknown as Entity<Exclude<K, T>>
  }

  /** Get a component. Non-nullable when `T` is one of the known components `K`. */
  get<T extends object>(type: ComponentType<T>): T | ([T] extends [K] ? never : undefined) {
    const instance = this._released ? undefined : this.engine.components.find(type)?.get(this.index)
    return instance as T | ([T] extends [K] ? never : undefined)
  }

  has<T extends object>(type: ComponentType<T>): this is Entity<K | T> {
    return !this._released && (this.engine.components.find(type)?.has(this.index) ?? false)
  }

  /** Add a string tag. Tags are zero-field components, so queries can use them. */
  tag(name: string): this {
    this.add(this.engine.components.tag(name))
    return this
  }

  untag(name: string): this {
    const type = this.engine.components.findTag(name)
    if (type) this.remove(type)
    return this
  }

  is(name: string): boolean {
    const type = this.engine.components.findTag(name)
    return type !== undefined && this.has(type)
  }

  /** The entity's tags. */
  get tags(): string[] {
    const out: string[] = []
    for (const id of this.bits()) {
      const info = this.engine.components.getById(id)
      if (info?.isTag) out.push(this.engine.components.tagName(info.type)!)
    }
    return out
  }

  /** The component types the entity currently has, tags excluded. */
  types(): ComponentType[] {
    const out: ComponentType[] = []
    for (const id of this.bits()) {
      const info = this.engine.components.getById(id)
      if (info && !info.isTag) out.push(info.type)
    }
    return out
  }

  destroy(): void {
    this.engine.destroyEntity(this)
  }

  serialize(): EntitySnapshot {
    const components: Record<string, ComponentSnapshot> = {}
    const tags: string[] = []
    for (const id of this.bits()) {
      const store = this.engine.components._storeById(id)
      if (!store) continue
      if (store.info.isTag) {
        tags.push(this.engine.components.tagName(store.info.type)!)
      } else {
        const instance = store.get(this.index)
        if (instance !== undefined) components[store.info.name] = serializeComponent(instance)
      }
    }
    return { id: this.id, name: this.name, tags, components }
  }

  /** The component bits set for this entity; none once released. */
  private bits(): number[] {
    return this._released ? [] : this.engine.masks.bits(this.index)
  }
}
