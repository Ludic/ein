import { Component } from './Component'
import { EntityManager } from './EntityManager'
import { Engine } from './Engine'

let next_id: number = 0

export class Entity {
  id: number
  alive: boolean
  class_name: string

  component_classes: string[]
  components: {[key: string]: Component}
  components_to_remove: {[key: string]: Component}
  entity_manager: EntityManager

  constructor(entity_manager: EntityManager) {
    this.id = next_id++
    this.alive = false
    this.class_name = this.constructor.name

    this.component_classes = []
    this.components = {}
    this.components_to_remove = {}
    this.entity_manager = entity_manager
  }

  getComponent(class_name: string): Component {
    return this.components[class_name]
  }

  getComponents(): {[key: string]: Component} {
    return this.components
  }

  getComponentsToRemove(): {[key: string]: Component} {
    return this.components_to_remove
  }

  getComponentClasses(): string[] {
    return this.component_classes
  }

  addComponent(component_class: string, data: any): Entity {
    this.entity_manager.entityAddComponent(this, component_class, data)
    return this
  }

  removeComponent(component_class: string, forceRemove: boolean = false): Entity {
    this.entity_manager.entityRemoveComponent(this, component_class, forceRemove)
    return this
  }

  hasComponent(component_class: string): boolean {
    return this.component_classes.includes(component_class)
  }

  // hasRemovedComponent(component_class: string): boolean {
  //   return this.components_to_remove.includes(component_class)
  // }

  hasAllComponents(component_classes: string[]): boolean {
    for(let i = 0; i < component_classes.length; i++) {
      if(!this.hasComponent(component_classes[i])) return false
    }
    return true
  }

  hasAnyComponents(component_classes: string[]): boolean {
    for (let i = 0; i < component_classes.length; i++) {
      if (this.hasComponent(component_classes[i])) return true
    }
    return false
  }

  removeAllComponents(forceRemove: boolean = true) {
    return this.entity_manager.entityRemoveAllComponents(this, forceRemove)
  }

  // Initialize the entity. To be used when returning an entity to the pool
  reset(): void {
    this.id = next_id++
    // delete this.entity_manager
    this.component_classes.length = 0
    this.components = {}
  }

  remove(forceRemove: boolean = false) {
    return this.entity_manager.removeEntity(this, forceRemove)
  }
}
