import { Component } from './Component'
import { EntityManager } from './EntityManager'
import { Engine } from './Engine'

let next_id: number = 0

export class Entity {
  id: number
  class: string
  entity_manager: EntityManager
  component_classes: string[]
  components: {[key: string]: Component}
  components_to_remove: {[key: string]: Component}
  alive: boolean

  constructor(entity_manager: EntityManager) {
    this.id = next_id++
    this.entity_manager = entity_manager
    this.component_classes = []
    this.components = {}
    this.components_to_remove = {}
    this.alive = false
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

  // getMutableComponent(klass: Klass<Component>): Component {
  //   let component = this.components[klass.name]
  //   for(let i = 0; i < this.queries.length; i++){
  //     let query: any = this.queries[i]
  //     // @todo accelerate this check. Maybe having query.components as an object
  //     if(query.reactive && query.Components.indexOf(klass) !== -1){
  //       query.eventDispatcher.dispatchEvent(
  //         // @ts-ignore
  //         Query.prototype.COMPONENT_CHANGED,
  //         this,
  //         component
  //       )
  //     }
  //   }
  //   return component
  // }

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

  serialize(): any {
    return {
      id: this.id,
      components: this.getComponents()
    }
  }

  // syncComponents(components: any, reactive: boolean = true): void {
  //   for(let [klassName, component] of Object.entries(components)){
  //     let current: any = this.components[klassName]
  //     for(let [key, value] of Object.entries(component)){
  //       if(current[key] != value){
  //         if(reactive){
  //           const klass: Klass<Component> | undefined = this.getComponentKlassByName(klassName)
  //           if(klass){
  //             let componentToUpdate: any = this.getMutableComponent(klass)
  //             componentToUpdate[key] = value
  //           }
  //         } else {
  //           current[key] = value
  //         }
  //       }
  //     }
  //   }
  // }

  // canBeCloned(val: any): boolean {
  //   if(Object(val) !== val) // Primitive value
  //     return true;
  //   switch({}.toString.call(val).slice(8,-1)) { // Class
  //     case 'Boolean':     case 'Number':      case 'String':      case 'Date':
  //     case 'RegExp':      case 'Blob':        case 'FileList':
  //     case 'ImageData':   case 'ImageBitmap': case 'ArrayBuffer':
  //       return true;
  //     case 'Array':       case 'Object':
  //       return Object.keys(val).every(prop => this.canBeCloned(val[prop]))
  //     case 'Map':
  //       return [...val.keys()].every(this.canBeCloned)
  //         && [...val.values()].every(this.canBeCloned)
  //     case 'Set':
  //       return [...val.keys()].every(this.canBeCloned)
  //     default:
  //       return false;
  //   }
  // }

  remove(forceRemove: boolean = false) {
    return this.entity_manager.removeEntity(this, forceRemove)
  }
}
