import {
  ComponentManager,
  Entity,
  EntityManager,
  System,
  SystemManager,
  Family,
  FamilyManager,
  Klass
} from "./"

export class Engine {
  component_manager: ComponentManager
  entity_manager: EntityManager
  system_manager: SystemManager
  family_manager: FamilyManager

  enabled: boolean

  constructor(){
    this.component_manager = new ComponentManager(this)
    this.entity_manager = new EntityManager(this)
    this.system_manager = new SystemManager(this)
    this.family_manager = new FamilyManager(this)
    this.enabled = true
  }

  execute(delta: number, time: number) {
    if(this.enabled){
      this.system_manager.execute(delta, time)
    }
  }

  addSystem(system_klass: Klass<System>): System {
    return this.system_manager.addSystem(system_klass)
  }

  createEntity(name?: string): Entity {
    return this.entity_manager.createEntity(name)
  }


}
