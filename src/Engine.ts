import { ComponentManager } from "./ComponentManager"

import { Entity } from "./Entity"
import { EntityManager } from "./EntityManager"

import { System } from "./System"
import { SystemManager } from "./SystemManager"

export class Engine {
  component_manager: ComponentManager
  entity_manager: EntityManager
  system_manager: SystemManager

  enabled: boolean

  constructor(){
    this.component_manager = new ComponentManager()
    this.entity_manager = new EntityManager(this.component_manager)
    this.system_manager = new SystemManager(this)
    this.enabled = true
  }

  execute(delta: number, time: number) {
    if(this.enabled){
      this.system_manager.execute(delta, time)
    }
  }

  createEntity(): Entity {
    return this.entity_manager.createEntity()
  }

  addSystem(system: System): System {
    return this.system_manager.addSystem(system)
  }
}
