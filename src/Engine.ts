import { Component } from './Component'
import { ComponentManager } from './ComponentManager'
import { Entity } from './Entity'
import { EntityManager } from './EntityManager'
import { System } from './System'
import { SystemManager } from './SystemManager'
import { FamilyManager } from './FamilyManager'
import { Query } from './Query'
import { QueryManager } from './QueryManager'
import { Klass } from './Klass'

export class Engine {
  component_manager: ComponentManager
  entity_manager: EntityManager
  system_manager: SystemManager
  family_manager: FamilyManager
  query_manager: QueryManager

  executions: number
  enabled: boolean

  constructor(){
    this.component_manager = new ComponentManager(this)
    this.entity_manager = new EntityManager(this)
    this.system_manager = new SystemManager(this)
    this.family_manager = new FamilyManager(this)
    this.query_manager = new QueryManager(this)

    this.executions = 0
    this.enabled = true
  }

  createEntity(name?: string): Entity {
    return this.entity_manager.createEntity(name)
  }

  addSystem(system_klass: Klass<System>): System {
    return this.system_manager.addSystem(system_klass)
  }

  async execute(delta: number, time: number): Promise<void> {
    if(this.enabled){
      await this.system_manager.execute(delta, time)
    }
    this.executions++
  }

  entitiesForQuery(query: Query): Entity[] {
    return this.query_manager.entitiesForQuery(query)
  }
}
