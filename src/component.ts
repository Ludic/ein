import type { Engine } from './engine'
import { Pool } from './pool'
import type { ComponentData } from './types'

/** Any class with a no-argument constructor can be a component. */
export type ComponentType<T extends object = object> = new () => T

export interface ComponentOptions<T extends object = object> {
  /** Name used for serialization and lookups. Defaults to the class name. */
  name?: string
  /**
   * Keep released instances in a pool of this initial size and reuse them.
   * Pooled components should implement `reset(): void` to restore their defaults;
   * otherwise the field values of a fresh instance are copied back (shallowly).
   */
  pool?: number
  /** Create instances yourself, for example to wrap them in a reactive proxy. */
  create?: () => T
}

export interface ComponentInfo<T extends object = object> {
  readonly type: ComponentType<T>
  /** Bit index in entity masks. Stable for the lifetime of the engine. */
  readonly id: number
  readonly name: string
  /** True for components created by `engine.tag()`. */
  readonly isTag: boolean
}

export type ComponentSnapshot = Record<string, unknown>

/** Optional base class for components. Only adds a default `serialize()`. */
export class Component {
  serialize(): ComponentSnapshot {
    return { ...(this as object) }
  }
}

/** Base class of the zero-field components that back string tags. */
export class Tag {}

interface Resettable {
  reset(): void
}
interface Serializable {
  serialize(): ComponentSnapshot
}

function hasReset(value: object): value is Resettable {
  return typeof (value as Resettable).reset === 'function'
}

/** Snapshot a component as plain data: its own `serialize()` if it has one, else its own enumerable fields. */
export function serializeComponent(instance: object): ComponentSnapshot {
  if (typeof (instance as Serializable).serialize === 'function') {
    return (instance as Serializable).serialize()
  }
  return { ...instance }
}

/**
 * Per-type storage: one array indexed by entity slot. Low level; prefer the
 * `Entity` methods.
 */
export class ComponentStore<T extends object = object> {
  readonly info: ComponentInfo<T>
  readonly options: ComponentOptions<T>
  /** Instances indexed by entity slot. */
  readonly instances: Array<T | undefined> = []
  size: number = 0

  private readonly create: () => T
  private readonly pool: Pool<T> | undefined
  private readonly defaults: Array<[string, unknown]> | undefined
  private readonly pending: T[] = []

  constructor(info: ComponentInfo<T>, options: ComponentOptions<T>) {
    this.info = info
    this.options = options
    const type = info.type
    this.create = options.create ?? ((): T => new type())
    if (options.pool !== undefined) {
      this.pool = new Pool(this.create, options.pool)
      this.defaults = Object.entries(this.create())
    }
  }

  /** Create or reuse an instance, restore defaults and apply `data`. */
  acquire(data?: ComponentData<T>): T {
    let instance: T
    if (this.pool) {
      instance = this.pool.acquire()
      if (hasReset(instance)) {
        instance.reset()
      } else if (this.defaults) {
        const target = instance as Record<string, unknown>
        for (const [key, value] of this.defaults) target[key] = value
      }
    } else {
      instance = this.create()
    }
    if (data !== undefined) Object.assign(instance, data)
    return instance
  }

  get(slot: number): T | undefined {
    return this.instances[slot]
  }

  has(slot: number): boolean {
    return this.instances[slot] !== undefined
  }

  attach(slot: number, instance: T): void {
    this.instances[slot] = instance
    this.size++
  }

  /** Detach the instance at `slot`. It is returned to the pool on the next flush. */
  detach(slot: number): T | undefined {
    const instance = this.instances[slot]
    if (instance === undefined) return undefined
    this.instances[slot] = undefined
    this.size--
    if (this.pool) this.pending.push(instance)
    return instance
  }

  /** @internal */
  _hasPending(): boolean {
    return this.pending.length > 0
  }

  /** @internal */
  _releasePending(): void {
    if (this.pool) for (const instance of this.pending) this.pool.release(instance)
    this.pending.length = 0
  }
}

export class ComponentManager implements Iterable<ComponentInfo> {
  readonly engine: Engine

  private readonly stores = new Map<ComponentType, ComponentStore>()
  private readonly storesById: ComponentStore[] = []
  private readonly byName = new Map<string, ComponentStore>()
  private readonly tags = new Map<string, ComponentType<Tag>>()
  private readonly tagNames = new Map<ComponentType, string>()
  private readonly pendingStores = new Set<ComponentStore>()

  constructor(engine: Engine) {
    this.engine = engine
  }

  /**
   * Register a component type. Types are registered automatically on first use,
   * so this is only needed to pass options.
   */
  register<T extends object>(
    type: ComponentType<T>,
    options: ComponentOptions<T> = {},
  ): ComponentInfo<T> {
    const existing = this.stores.get(type)
    if (existing) {
      if (Object.keys(options).length > 0) {
        throw new Error(
          `ein: component '${existing.info.name}' is already registered; options must be passed before first use`,
        )
      }
      return existing.info as ComponentInfo<T>
    }
    const id = this.storesById.length
    const name = options.name ?? (type.name || `Component${id}`)
    if (this.byName.has(name)) {
      throw new Error(
        `ein: a component named '${name}' is already registered; pass a unique 'name' option`,
      )
    }
    const info: ComponentInfo<T> = { type, id, name, isTag: type.prototype instanceof Tag }
    const store = new ComponentStore<T>(info, options)
    this.stores.set(type, store as ComponentStore)
    this.storesById.push(store as ComponentStore)
    this.byName.set(name, store as ComponentStore)
    if (this.engine.masks.ensureBits(id + 1)) this.engine.queries._rebuildMasks()
    this.engine.events.emit('component:registered', info)
    return info
  }

  /**
   * Swap the class behind a registered component type, keeping its id, name and
   * options. Existing instances are re-created from the new class with their
   * fields copied over, so queries and entities are unaffected. Used by hot
   * module replacement.
   */
  replace<T extends object>(prev: ComponentType, next: ComponentType<T>): ComponentInfo<T> {
    const old = this.stores.get(prev)
    if (!old) throw new Error('ein: cannot replace a component type that is not registered')
    if ((prev as ComponentType) === next) return old.info as ComponentInfo<T>
    if (this.stores.has(next))
      throw new Error('ein: the replacement component type is already registered')
    const info: ComponentInfo<T> = {
      type: next,
      id: old.info.id,
      name: old.info.name,
      isTag: old.info.isTag,
    }
    const store = new ComponentStore<T>(info, old.options as ComponentOptions<T>)
    for (let slot = 0; slot < old.instances.length; slot++) {
      const instance = old.instances[slot]
      if (instance === undefined) continue
      const fresh = store.acquire()
      Object.assign(fresh, instance)
      store.attach(slot, fresh)
    }
    this.stores.delete(prev)
    this.stores.set(next, store as ComponentStore)
    this.storesById[info.id] = store as ComponentStore
    this.byName.set(info.name, store as ComponentStore)
    this.pendingStores.delete(old)
    const tagName = this.tagNames.get(prev)
    if (tagName !== undefined) {
      this.tags.set(tagName, next as ComponentType<Tag>)
      this.tagNames.delete(prev)
      this.tagNames.set(next, tagName)
    }
    this.engine.events.emit('component:replaced', old.info, info)
    return info
  }

  /** The store for a type, registering it if needed. */
  store<T extends object>(type: ComponentType<T>): ComponentStore<T> {
    const store = this.stores.get(type)
    if (store) return store as ComponentStore<T>
    this.register(type)
    return this.stores.get(type) as ComponentStore<T>
  }

  /** The store for a type, or undefined when it was never registered. */
  find<T extends object>(type: ComponentType<T>): ComponentStore<T> | undefined {
    return this.stores.get(type) as ComponentStore<T> | undefined
  }

  get<T extends object>(type: ComponentType<T>): ComponentInfo<T> | undefined {
    return this.stores.get(type)?.info as ComponentInfo<T> | undefined
  }

  getById(id: number): ComponentInfo | undefined {
    return this.storesById[id]?.info
  }

  getByName(name: string): ComponentInfo | undefined {
    return this.byName.get(name)?.info
  }

  has(type: ComponentType): boolean {
    return this.stores.has(type)
  }

  /** The component type that backs a string tag, created on first use. */
  tag(name: string): ComponentType<Tag> {
    let type = this.tags.get(name)
    if (!type) {
      type = class extends Tag {}
      Object.defineProperty(type, 'name', { value: `#${name}` })
      this.tags.set(name, type)
      this.tagNames.set(type, name)
      this.register(type, { name: `#${name}` })
    }
    return type
  }

  /** The component type behind a tag, or undefined if the tag was never used. */
  findTag(name: string): ComponentType<Tag> | undefined {
    return this.tags.get(name)
  }

  /** The tag name of a tag component type. */
  tagName(type: ComponentType): string | undefined {
    return this.tagNames.get(type)
  }

  get size(): number {
    return this.storesById.length
  }

  *[Symbol.iterator](): IterableIterator<ComponentInfo> {
    for (const store of this.storesById) yield store.info
  }

  /** @internal */
  _storeById(id: number): ComponentStore | undefined {
    return this.storesById[id]
  }

  /** @internal */
  _markPending(store: ComponentStore): void {
    if (store._hasPending()) this.pendingStores.add(store)
  }

  /** @internal */
  _releasePending(): void {
    if (this.pendingStores.size === 0) return
    for (const store of this.pendingStores) store._releasePending()
    this.pendingStores.clear()
  }
}
