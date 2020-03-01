import { Component } from "./Component"
import { ComponentManager } from './ComponentManager'
import { Entity } from "./Entity"

import { EventDispatcher } from "./EventDispatcher"

import { Engine } from "./Engine"


export class EntityManager {
  entities: Entity[]
  entitiesToRemove: Entity[]
  entitiesWithComponentsToRemove: Entity[]

  engine: Engine
  componentManager: ComponentManager

  entityPool: ObjectPool
  queryManager: QueryManager
  eventDispatcher: EventDispatcher
  numStateComponents: number

  constructor(engine: Engine) {
    this.engine = engine
    this.componentManager = engine.componentsManager

    // All the entities in this instance
    this.entities = []
    this.queryManager = new QueryManager(this)
    this.eventDispatcher = new EventDispatcher()
    this.entityPool = new ObjectPool(Entity)

    // Deferred deletion
    this.entitiesWithComponentsToRemove = []
    this.entitiesToRemove = []

    this.numStateComponents = 0
  }

  /**
   * Create a new entity
   */
  createEntity() {
    let entity = this.entityPool.aquire()
    entity.alive = true
    entity.engine = this
    this.entities.push(entity)
    this.eventDispatcher.dispatchEvent(ENTITY_CREATED, entity)
    return entity
  }

  // COMPONENTS

  /**
   * Add a component to an entity
   * @param {Entity} entity Entity where the component will be added
   * @param {Component} Component Component to be added to the entity
   * @param {Object} values Optional values to replace the default attributes
   */
  entityAddComponent(entity: Entity, klass: Klass<Component>, values: any) {
    if (~entity.componentKlasses.indexOf(klass)) return

    entity.componentKlasses.push(klass)

    let componentPool = this.engine.componentsManager.getComponentsPool(klass)
    let component = componentPool.aquire()

    entity.components[klass.name] = component

    if (values) {
      if (component.copy) {
        component.copy(values)
      } else {
        for (let name in values) {
          component[name] = values[name]
        }
      }
    }

    this.queryManager.onEntityComponentAdded(entity, klass)
    this.engine.componentsManager.componentAddedToEntity(klass)

    this.eventDispatcher.dispatchEvent(COMPONENT_ADDED, entity, klass)
  }

  /**
   * Remove a component from an entity
   * @param {Entity} entity Entity which will get removed the component
   * @param {*} Component Component to remove from the entity
   * @param {Bool} immediately If you want to remove the component immediately instead of deferred (Default is false)
   */
  entityRemoveComponent(entity: Entity, klass: Klass<Component>, immediately?: boolean) {
    let index = entity.componentKlasses.indexOf(klass)
    if (!~index) return

    this.eventDispatcher.dispatchEvent(COMPONENT_REMOVE, entity, klass)

    if (immediately) {
      this._entityRemoveComponentSync(entity, klass, index)
    } else {
      if (entity.componentKlassesToRemove.length === 0)
        this.entitiesWithComponentsToRemove.push(entity)

      entity.componentKlasses.splice(index, 1)
      entity.componentKlassesToRemove.push(klass)

      let componentName = getName(klass)
      entity.componentsToRemove[componentName] =
        entity.components[componentName]
      delete entity.components[componentName]
    }

    // Check each indexed query to see if we need to remove it
    this.queryManager.onEntityComponentRemoved(entity, klass)
  }

  _entityRemoveComponentSync(entity: Entity, klass: Klass<Component>, index: number) {
    // Remove T listing on entity and property ref, then free the component.
    entity.componentKlasses.splice(index, 1)
    let propName: string = componentPropertyName(klass)
    let componentName: string = getName(klass)
    let component: Component = entity.components[componentName]
    delete entity.components[componentName]
    this.componentManager.componentPool[propName].release(component)
    this.engine.componentsManager.componentRemovedFromEntity(klass)
  }

  /**
   * Remove all the components from an entity
   * @param {Entity} entity Entity from which the components will be removed
   */
  entityRemoveAllComponents(entity: Entity, immediately?: boolean) {
    let klasses: Klass<Component>[] = entity.componentKlasses
    klasses.forEach((klass: Klass<Component>) => {
      // TODO not sure if this is correct
      this.entityRemoveComponent(entity, klass, immediately)
    })
  }

  /**
   * Remove the entity from this manager. It will clear also its components
   * @param {Entity} entity Entity to remove from the manager
   * @param {Bool} immediately If you want to remove the component immediately instead of deferred (Default is false)
   */
  removeEntity(entity: Entity, immediately?: boolean) {
    let index = this.entities.indexOf(entity)

    if (!~index) throw new Error("Tried to remove entity not in list")

    entity.alive = false

    if (this.numStateComponents === 0) {
      // Remove from entity list
      this.eventDispatcher.dispatchEvent(ENTITY_REMOVED, entity)
      this.queryManager.onEntityRemoved(entity)
      if (immediately === true) {
        this._releaseEntity(entity, index)
      } else {
        this.entitiesToRemove.push(entity)
      }
    }

    this.entityRemoveAllComponents(entity, immediately)
  }

  _releaseEntity(entity: Entity, index: number) {
    this.entities.splice(index, 1)

    // Prevent any access and free
    entity.engine = null
    this.entityPool.release(entity)
  }

  /**
   * Remove all entities from this manager
   */
  removeAllEntities() {
    for (let i = this.entities.length - 1; i >= 0; i--) {
      this.removeEntity(this.entities[i])
    }
  }

  processDeferredRemoval() {
    for (let i = 0; i < this.entitiesToRemove.length; i++) {
      let entity = this.entitiesToRemove[i]
      let index = this.entities.indexOf(entity)
      this._releaseEntity(entity, index)
    }
    this.entitiesToRemove.length = 0

    for (let i = 0; i < this.entitiesWithComponentsToRemove.length; i++) {
      let entity = this.entitiesWithComponentsToRemove[i]
      while (entity.componentKlassesToRemove.length > 0) {
        let klass: Klass<Component> | undefined = entity.componentKlassesToRemove.pop()

        let propName = componentPropertyName(Component)
        let componentName = getName(Component)
        let component = entity.componentsToRemove[componentName]
        delete entity.componentsToRemove[componentName]
        this.componentManager.componentPool[propName].release(component)
        if(klass) this.engine.componentsManager.componentRemovedFromEntity(klass)

        //this._entityRemoveComponentSync(entity, Component, index)
      }
    }

    this.entitiesWithComponentsToRemove.length = 0
  }

  /**
   * Get a query based on a list of components
   * @param {Array(Component)} Components List of components that will form the query
   */
  queryComponents(klasses: Klass<Component>[]) {
    return this.queryManager.getQuery(klasses)
  }

  // EXTRAS

  /**
   * Return number of entities
   */
  count() {
    return this.entities.length
  }

  /**
   * Return some stats
   */
  stats() {
    let stats = {
      numEntities: this.entities.length,
      numQueries: Object.keys(this.queryManager.queries).length,
      queries: this.queryManager.stats(),
      numComponentPool: Object.keys(this.componentManager.componentPool)
        .length,
      componentPool: {},
      eventDispatcher: this.eventDispatcher.stats
    }

    for (let cname in this.componentManager.componentPool) {
      let pool = this.componentManager.componentPool[cname]
      // @ts-ignore
      stats.componentPool[cname] = {
        used: pool.totalUsed(),
        size: pool.count
      }
    }

    return stats
  }
}

const ENTITY_CREATED = "EntityManager#ENTITY_CREATE"
const ENTITY_REMOVED = "EntityManager#ENTITY_REMOVED"
const COMPONENT_ADDED = "EntityManager#COMPONENT_ADDED"
const COMPONENT_REMOVE = "EntityManager#COMPONENT_REMOVE"
