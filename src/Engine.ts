import { QueryOptions, Query } from './Query'
import { ComponentManager } from './ComponentManager'
import { EntityManager } from './EntityManager'
import { SystemManager } from './SystemManager'
import { QueryManager } from './QueryManager'
import { Entity } from './Entity'
import { Klass } from './Klass'
import { System } from './System'
import { Component, ComponentConstructor, ComponentData, GetComponent } from './Component'
import { performance } from './Utils'
import { registerSystem, registerEngine } from './hmr/hmr'

export interface EngineOptions {
  entityAllocation?: number
}

export class Engine {
  component_manager: ComponentManager
  entity_manager: EntityManager
  system_manager: SystemManager
  query_manager: QueryManager

  enabled: boolean

  constructor(options: EngineOptions = {}){
    this.component_manager = new ComponentManager(this)
    this.entity_manager = new EntityManager(this, options?.entityAllocation ?? 1000)
    this.system_manager = new SystemManager(this)
    this.query_manager = new QueryManager(this)

    this.enabled = true

    if(import.meta.env.DEV){
      registerEngine(this)
    }
  }

  createEntity(name?: string): Entity {
    const entity = this.entity_manager.createEntity(name)
    this.query_manager.update()
    return entity
  }

  destroyEntity(ent: Entity<any>){
    this.entity_manager.destroyEntity(ent)
    this.query_manager.onEntityRemoved(ent)
  }

  addSystem(system_klass: Klass<System>): System {
    return this.system_manager.addSystem(system_klass)
  }

  registerComponent<C extends Component>(component: ComponentConstructor<C>, allocate?: number): this {
    this.component_manager.registerComponent(component, allocate)
    return this
  }

  update(delta: number, time: number) {
    if(this.enabled){
      this.query_manager.update(true)
      this.system_manager.update(delta, time)
      // this.system_manager.execute(delta, time, ()=>{
      //   // after each system execute, update the queries that are pending updates
      //   this.query_manager.update()
      // })
    }
  }

  // entitiesForQuery(query: Query): Entity[] {
  //   return this.query_manager.entitiesForQuery(query)
  // }

  createQuery(options: QueryOptions): Query<any> {
    return this.query_manager.createQuery(options)
  }

}
