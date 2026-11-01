import type { ComponentInfo, ComponentOptions, ComponentType, Tag } from './component'
import { ComponentManager } from './component'
import { EntityManager } from './entities'
import type { Entity, EntitySnapshot } from './entity'
import { Emitter } from './events'
import { MaskTable } from './masks'
import type { Query, QueryComponents, QueryOptions, QueryTerm } from './query'
import { QueryManager } from './query'
import type { FunctionSystem, System, SystemClass, SystemFn, SystemOptions } from './system'
import { SystemManager } from './system'

export interface EngineOptions {
  /**
   * When queries pick up structural changes during `update()`.
   * `'frame'` (default): once, before the first system runs.
   * `'system'`: additionally after every system, so later systems see what
   * earlier ones added or removed in the same frame. Query `added`/`removed`
   * lists stay per frame in both modes.
   */
  flush?: 'frame' | 'system'
  /** Initial number of entity slots to allocate. */
  capacity?: number
}

export type EngineEvents = {
  'entity:created': [entity: Entity]
  'entity:destroyed': [entity: Entity]
  'component:registered': [info: ComponentInfo]
  'component:replaced': [previous: ComponentInfo, next: ComponentInfo]
  'component:added': [entity: Entity, type: ComponentType, instance: object]
  'component:removed': [entity: Entity, type: ComponentType, instance: object]
  'system:added': [system: System]
  'system:removed': [system: System]
  'query:created': [query: Query]
  'query:disposed': [query: Query]
  'update:start': [delta: number, time: number]
  'update:end': [delta: number, time: number]
  flush: []
}

export interface EngineSnapshot {
  entities: EntitySnapshot[]
}

/** The world: owns entities, components, systems and queries. */
export class Engine {
  readonly entities: EntityManager
  readonly components: ComponentManager
  readonly systems: SystemManager
  readonly queries: QueryManager
  readonly events: Emitter<EngineEvents> = new Emitter()
  readonly masks: MaskTable
  readonly flushMode: 'frame' | 'system'

  enabled: boolean = true
  /** Delta passed to the last `update()`. */
  delta: number = 0
  /** Time passed to the last `update()`. */
  time: number = 0

  constructor(options: EngineOptions = {}) {
    this.flushMode = options.flush ?? 'frame'
    this.masks = new MaskTable(options.capacity ?? 1024)
    this.queries = new QueryManager(this)
    this.components = new ComponentManager(this)
    this.entities = new EntityManager(this)
    this.systems = new SystemManager(this)
  }

  createEntity(name?: string): Entity {
    return this.entities.create(name)
  }

  destroyEntity(entity: Entity): void {
    this.entities.destroy(entity)
  }

  getEntity(id: number): Entity | undefined {
    return this.entities.get(id)
  }

  /** Register a component type with options. Types used without registering are registered with defaults. */
  registerComponent<T extends object>(type: ComponentType<T>, options?: ComponentOptions<T>): this {
    this.components.register(type, options)
    return this
  }

  /** The component type behind a string tag, usable in queries. */
  tag(name: string): ComponentType<Tag> {
    return this.components.tag(name)
  }

  addSystem<S extends System>(system: S | SystemClass<S>, options?: SystemOptions): S
  addSystem(system: SystemFn, options?: SystemOptions): FunctionSystem
  addSystem(system: System | SystemClass | SystemFn, options?: SystemOptions): System {
    return this.systems.add(system as System, options)
  }

  removeSystem(system: System): boolean {
    return this.systems.remove(system)
  }

  createQuery<const A extends readonly QueryTerm[] = readonly []>(
    options: QueryOptions<A>,
  ): Query<QueryComponents<A>> {
    return this.queries.create(options)
  }

  /** Run one frame: flush, then every enabled system in order. */
  update(delta: number, time: number): void {
    this.delta = delta
    this.time = time
    if (!this.enabled) return
    this.events.emit('update:start', delta, time)
    this.queries._beginFrame()
    this.flush()
    this.queries._beginSystems()
    const systems = this.systems.list
    const perSystem = this.flushMode === 'system'
    for (let i = 0; i < systems.length; i++) {
      const system = systems[i]!
      if (!system.shouldUpdate()) continue
      system.update(delta, time)
      system._tick(time)
      if (perSystem) this.flush()
    }
    this.queries._endFrame()
    this.events.emit('update:end', delta, time)
  }

  /**
   * Apply pending structural changes now: update query membership, fire query
   * listeners, then release destroyed entities and removed components.
   */
  flush(): void {
    this.queries._flush()
    this.entities._releasePending()
    this.components._releasePending()
    this.events.emit('flush')
  }

  /** Destroy every entity and flush. Systems and queries stay. */
  clear(): void {
    for (const entity of this.entities) this.entities.destroy(entity)
    this.flush()
  }

  serialize(): EngineSnapshot {
    const entities: EntitySnapshot[] = []
    for (const entity of this.entities) if (entity.alive) entities.push(entity.serialize())
    return { entities }
  }
}
