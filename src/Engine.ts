import { QueryOptions, Query } from './Query'
import { ComponentManager } from './ComponentManager'
import { EntityManager } from './EntityManager'
import { SystemManager } from './SystemManager'
import { QueryManager } from './QueryManager'
import { Entity } from './Entity'
import { Klass } from './Klass'
import { System } from './System'

export class Engine {
  component_manager: ComponentManager
  entity_manager: EntityManager
  system_manager: SystemManager
  query_manager: QueryManager

  executions: number
  enabled: boolean

  constructor(){
    this.component_manager = new ComponentManager(this)
    this.entity_manager = new EntityManager(this)
    this.system_manager = new SystemManager(this)
    this.query_manager = new QueryManager(this)

    this.executions = 0
    this.enabled = true
  }

  createEntity(name?: string): Entity {
    const entity = this.entity_manager.createEntity(name)
    this.query_manager.update()
    return entity
  }

  addSystem(system_klass: Klass<System>): System {
    return this.system_manager.addSystem(system_klass)
  }

  execute(delta: number, time: number) {
    if(this.enabled){
      this.system_manager.execute(delta, time, ()=>{
        // after each system execute, update the queries that are pending updates
        this.query_manager.update()
      })
    }
    this.executions++
  }

  // entitiesForQuery(query: Query): Entity[] {
  //   return this.query_manager.entitiesForQuery(query)
  // }

  createQuery(options: QueryOptions): Query {
    return this.query_manager.createQuery(options)
  }
}
