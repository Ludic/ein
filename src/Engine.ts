import { EntityManager } from "./EntityManager"
import { ComponentManager } from "./ComponentManager"
import { SystemManager } from "./SystemManager"

export class Engine {
  componentsManager: ComponentManager
  entityManager: EntityManager
  systemManager: SystemManager


  enabled: boolean

  constructor(){
    this.componentsManager = new ComponentManager(this)
    this.entityManager = new EntityManager(this)
    this.systemManager = new SystemManager(this)
    this.enabled = true
  }

  createEntity(){
    return this.entityManager.createEntity()
  }
}
