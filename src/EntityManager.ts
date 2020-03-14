import { Component } from "./Component"
import { TransferableComponent } from "./TransferableComponent"
import { ComponentManager } from './ComponentManager'

import { Entity } from "./Entity"

import { EventDispatcher } from "./EventDispatcher"
import { Engine } from "./Engine"

export class EntityManager {
  entities: Entity[]
  name_to_entities: {[key: string]: Entity[]}

  component_manager: ComponentManager
  event_dispatcher: EventDispatcher
  engine: Engine

  constructor(engine: Engine){
    this.entities = []
    this.name_to_entities = {}

    this.component_manager = engine.component_manager
    this.engine = engine
    this.event_dispatcher = new EventDispatcher()
  }

  createEntity(name: string = ""): Entity {
    // TODO Object pool
    let entity: Entity = new Entity(this, name)

    this.entities.push(entity)
    this.name_to_entities[entity.name] ? this.name_to_entities[entity.name].push(entity) : this.name_to_entities[entity.name] = [entity]

    // TODO, just call other managers directly? or use pub/sub?
    // this.event_dispatcher.dispatchEvent(ENTITY_CREATED, entity)

    return entity
  }

  addComponent(entity: Entity, component_class: string, data: any, is_transferable: boolean = false): Entity {
    if(!entity.getComponentClasses().includes(component_class)) return entity

    // TODO don't like this
    let component: Component
    if(is_transferable){
      component = new TransferableComponent(data)
    } else {
      component = new Component(data)
    }

    entity.class_to_component[component_class] = component

    // this.queryManager.onEntityComponentAdded(entity, klass)
    this.component_manager.componentAddedToEntity(component_class)
    this.event_dispatcher.dispatchEvent(COMPONENT_ADDED, entity, component)

    return entity
  }

  removeComponent(entity: Entity, component_class: string): Entity {
    let component: Component = entity.class_to_component[component_class]
    if(!component) return entity

    this.event_dispatcher.dispatchEvent(COMPONENT_REMOVE, entity, component)
    delete entity.class_to_component[component_class]

    return entity
  }

  removeAllComponents(entity: Entity): Entity {
    entity.getComponentClasses().forEach((component_class: string)=>{
      this.removeComponent(entity, component_class)
    })

    return entity
  }

  removeEntity(entity: Entity): void {
    const index: number = this.entities.indexOf(entity)
    if(index === -1) throw new Error("Tried to remove entity not in list")
    entity.active = false

    this.event_dispatcher.dispatchEvent(ENTITY_REMOVED, entity)
    this.entities.splice(index, 1)
  }

  removeAllEntities() {
    for(let i = this.entities.length - 1; i >= 0; i--){
      this.removeEntity(this.entities[i])
    }
  }
}

const ENTITY_CREATED: string = "EntityManager#ENTITY_CREATE"
const ENTITY_REMOVED: string = "EntityManager#ENTITY_REMOVED"
const COMPONENT_ADDED: string = "EntityManager#COMPONENT_ADDED"
const COMPONENT_REMOVE: string = "EntityManager#COMPONENT_REMOVE"
