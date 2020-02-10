// [[file:~/repos/mine/README.org::*ComponentManager][ComponentManager:1]]
import { Klass } from './Klass'
import { Component } from './Component'
import { ObjectPool } from "./ObjectPool"
import { DummyObjectPool } from "./DummyObjectPool"
import { componentPropertyName } from "./Utils"

export class ComponentManager {
  klasses: {[key: string]: Klass<Component>}
  componentPool: {[key: string]: ObjectPool | DummyObjectPool}
  numComponents: {[key: string]: number}

  constructor() {
    this.klasses = {}
    this.componentPool = {}
    this.numComponents = {}
  }

  registerComponent(klass: Klass<Component>): void {
    if(this.klasses[klass.name]) {
      console.warn(`Component type: '${Component.name}' already registered.`)
      return
    }

    this.klasses[klass.name] = klass
    this.numComponents[klass.name] = 0
  }

  componentAddedToEntity(klass: Klass<Component>): void {
    if(!this.numComponents[klass.name]) this.numComponents[klass.name] = 1
    else this.numComponents[klass.name]++
  }

  componentRemovedFromEntity(klass: Klass<Component>): void {
    this.numComponents[klass.name]--
  }

  getComponentsPool(klass: Klass<Component>): ObjectPool | DummyObjectPool {
    const componentName = componentPropertyName(klass)
    if(!this.componentPool[componentName]) {
      if(klass.prototype.reset) {
        this.componentPool[componentName] = new ObjectPool(klass)
      } else {
        console.warn(`Component '${Component.name}' won't benefit from pooling because 'reset' method was not implemeneted.`)
        this.componentPool[componentName] = new DummyObjectPool(klass)
      }
    }
    return this.componentPool[componentName]
  }
}
// ComponentManager:1 ends here
