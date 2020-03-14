import { Component } from './Component'
import { EntityManager } from './EntityManager'
import { Engine } from './Engine'

let next_id: number = 0

export class Entity {
  id: number
  active: boolean
  name: string

  class_to_component: {[key: string]: Component}
  entity_manager: EntityManager

  constructor(entity_manager: EntityManager, name: string = "") {
    this.id = next_id++
    this.name = name
    this.active = true

    this.class_to_component = {}
    this.entity_manager = entity_manager
  }

  addComponent(component_class: string, data: any): Entity {
    this.entity_manager.addComponent(this, component_class, data)
    return this
  }

  getComponent(class_name: string): Component {
    return this.class_to_component[class_name]
  }

  getComponentClasses(): string[] {
    return Object.keys(this.class_to_component)
  }

  removeComponent(component_class: string): Entity {
    this.entity_manager.removeComponent(this, component_class)
    return this
  }

  hasComponent(component_class: string): boolean {
    return this.getComponentClasses().includes(component_class)
  }

  hasAllComponents(component_classes: string[]): boolean {
    for(let i = 0; i < component_classes.length; i++){
      if(!this.hasComponent(component_classes[i])) return false
    }
    return true
  }

  hasAnyComponents(component_classes: string[]): boolean {
    for(let i = 0; i < component_classes.length; i++){
      if(this.hasComponent(component_classes[i])) return true
    }
    return false
  }

  removeAllComponents(){
    return this.entity_manager.removeAllComponents(this)
  }

  remove(): void {
    return this.entity_manager.removeEntity(this)
  }
}
