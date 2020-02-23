import { Klass } from './Klass'
import { Component } from './Component'
import { Engine } from './Engine'

import { Query } from "./Query"
import { wrapImmutableComponent } from "./WrapImmutableComponent"

let nextId = 0

export class Entity {
  engine: any
  id: number
  componentKlasses: Klass<Component>[]
  components: {[key: string]: Component}
  componentsToRemove: {[key: string]: Component}
  queries: Query[]
  componentKlassesToRemove: Klass<Component>[]
  alive: boolean

  constructor(engine: Engine) {
    this.engine = engine

    // Unique ID for this entity
    this.id = nextId++

    // List of components types the entity has
    this.componentKlasses = []

    // Instance of the components
    this.components = {}

    this.componentsToRemove = {}

    // Queries where the entity is added
    this.queries = []

    // Used for deferred removal
    this.componentKlassesToRemove = []

    this.alive = false
  }

  // COMPONENTS
  getComponent(klass: Klass<Component>, includeRemoved: boolean = false): Component {
    let component: Component = this.components[klass.name]
    if(!component && includeRemoved === true) component = this.componentsToRemove[klass.name]

    return DEBUG ? wrapImmutableComponent(klass, component) : component
  }

  getRemovedComponent(klass: Klass<Component>): Component {
    return this.componentsToRemove[klass.name]
  }

  getComponents(): {[key: string]: Component} {
    return this.components
  }

  getComponentsToRemove(): {[key: string]: Component} {
    return this.componentsToRemove
  }

  getComponentTypes(): Klass<Component>[] {
    return this.componentKlasses
  }

  getComponentKlassByName(name: string): Klass<Component> | undefined {
    return this.componentKlasses.find((klass: Klass<Component>)=>{
      return klass.name == name
    })
  }

  getMutableComponent(klass: Klass<Component>): Component {
    let component = this.components[klass.name]
    for(let i = 0; i < this.queries.length; i++){
      let query: any = this.queries[i]
      // @todo accelerate this check. Maybe having query.components as an object
      if(query.reactive && query.Components.indexOf(klass) !== -1){
        query.eventDispatcher.dispatchEvent(
          // @ts-ignore
          Query.prototype.COMPONENT_CHANGED,
          this,
          component
        )
      }
    }
    return component
  }

  addComponent(klass: Klass<Component>, values: any): Entity {
    this.engine.entityAddComponent(this, klass, values)
    return this
  }

  removeComponent(klass: Klass<Component>, forceRemove: any): Entity {
    this.engine.entityRemoveComponent(this, klass, forceRemove)
    return this
  }

  hasComponent(klass: Klass<Component>, includeRemoved: boolean = false): boolean {
    return (
      !!~this.componentKlasses.indexOf(klass) ||
      (includeRemoved === true && this.hasRemovedComponent(klass))
    )
  }

  hasRemovedComponent(klass: Klass<Component>): boolean {
    return !!~this.componentKlassesToRemove.indexOf(klass)
  }

  hasAllComponents(klasses: Klass<Component>[]): boolean {
    for(let i = 0; i < klasses.length; i++) {
      if(!this.hasComponent(klasses[i])) return false
    }
    return true
  }

  hasAnyComponents(klasses: Klass<Component>[]): boolean {
    for (let i = 0; i < klasses.length; i++) {
      if (this.hasComponent(klasses[i])) return true
    }
    return false
  }

  removeAllComponents(forceRemove: boolean) {
    return this.engine.entityRemoveAllComponents(this, forceRemove)
  }

  // EXTRAS
  // Initialize the entity. To be used when returning an entity to the pool
  reset(): void {
    this.id = nextId++
    this.engine = null
    this.componentKlasses.length = 0
    this.queries.length = 0
    this.components = {}
  }

  serialize(): any {
    return {
      id: this.id,
      components: this.getComponents()
    }
  }

  syncComponents(components: any, reactive: boolean = true): void {
    for(let [klassName, component] of Object.entries(components)){
      let current: any = this.components[klassName]
      for(let [key, value] of Object.entries(component)){
        if(current[key] != value){
          if(reactive){
            const klass: Klass<Component> | undefined = this.getComponentKlassByName(klassName)
            if(klass){
              let componentToUpdate: any = this.getMutableComponent(klass)
              componentToUpdate[key] = value
            }
          } else {
            current[key] = value
          }
        }
      }
    }
  }

  canBeCloned(val: any): boolean {
    if(Object(val) !== val) // Primitive value
      return true;
    switch({}.toString.call(val).slice(8,-1)) { // Class
      case 'Boolean':     case 'Number':      case 'String':      case 'Date':
      case 'RegExp':      case 'Blob':        case 'FileList':
      case 'ImageData':   case 'ImageBitmap': case 'ArrayBuffer':
        return true;
      case 'Array':       case 'Object':
        return Object.keys(val).every(prop => this.canBeCloned(val[prop]))
      case 'Map':
        return [...val.keys()].every(this.canBeCloned)
          && [...val.values()].every(this.canBeCloned)
      case 'Set':
        return [...val.keys()].every(this.canBeCloned)
      default:
        return false;
    }
  }

  remove(forceRemove?: boolean) {
    return this.engine.removeEntity(this, forceRemove)
  }
}
