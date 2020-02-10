// [[file:~/repos/mine/README.org::*Engine][Engine:1]]
// import { Klass } from './Klass'
// import { Component } from './Component'
// import { Entity } from './Entity'
// import { System } from './System'
import { SystemManager } from "./SystemManager"
import { EntityManager } from "./EntityManager"
import { ComponentManager } from "./ComponentManager"


export class Engine {
  systemManager: SystemManager
  entityManager: EntityManager
  componentsManager: ComponentManager

  enabled: boolean

  constructor(){
    this.systemManager = new SystemManager(this)
    this.entityManager = new EntityManager(this)
    this.componentsManager = new ComponentManager(this)

    this.enabled = true
  }

  createEntity(){
    return this.entityManager.createEntity()
  }
}
// Engine:1 ends here
