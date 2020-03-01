import { Entity } from "./Entity"
import { EntityManager } from "./EntityManager"

import { System } from "./System"
import { SystemManager } from "./SystemManager"

export class Engine {
  entityManager: EntityManager
  systemManager: SystemManager

  enabled: boolean

  constructor(){
    this.entityManager = new EntityManager(this)
    this.systemManager = new SystemManager(this)
    this.enabled = true
  }

  execute(delta: number, time: number) {
    if(this.enabled){
      this.systemManager.execute(delta, time)
    }
  }

  createEntity(): Entity {
    return this.entityManager.createEntity()
  }

  addSystem(system: System): System {
    return this.systemManager.addSystem(system)
  }
}
