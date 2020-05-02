import {
  Component,
  ComponentManager,
  Entity,
  EntityManager,
  System,
  SystemManager,
  FamilyManager,
  Query,
  QueryManager,
  Klass,
} from "./"

export class Engine {
  component_manager: ComponentManager
  entity_manager: EntityManager
  system_manager: SystemManager
  family_manager: FamilyManager
  query_manager: QueryManager

  enabled: boolean

  constructor(){
    this.component_manager = new ComponentManager(this)
    this.entity_manager = new EntityManager(this)
    this.system_manager = new SystemManager(this)
    this.family_manager = new FamilyManager(this)
    this.query_manager = new QueryManager(this)
    this.enabled = true
  }

  addComponentToEntity(entity: Entity, component_klass: Klass<Component>, data?: any): Component {
    return this.component_manager.addComponentToEntity(entity, component_klass, data)
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
  }

  entitiesForQuery(query: Query): Entity[] {
    return this.query_manager.entitiesForQuery(query)
  }
}
