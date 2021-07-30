import { Component, ComponentData, ComponentConstructor, ComponentInstance } from "./Component"
import { Entity } from "./Entity"
import { Klass } from "./Klass"
import { Engine } from "./Engine"
import { reactive, shallowReactive } from '@vue/reactivity'
import Pool from './pool'
import { bitShift } from './Utils'

export class ComponentManager {

  registry: Set<ComponentConstructor> = new Set()
  engine: Engine

  pools: WeakMap<ComponentConstructor, Pool<Component>> = new WeakMap()

  private componentId: number = 0

  constructor(engine: Engine){
    this.engine = engine
  }

  registerComponent<C extends Component>(ctor: ComponentConstructor<C>, allocate?: number){
    this.registry.add(ctor)
    this.pools.set(ctor, new Pool<C>(() => (Reflect.construct(ctor, []) as C)._reset(), allocate))
    ctor.id = this.nextComponentId()
    // if(ctor.id > 30){
    //   // bit shifting 1<<31 results in a negative number because 32-bit signed int
    //   // TODO: find way to fix this limitation.
    //   throw new Error('cannot register more than 62 components')
    // }
    ctor.mask = bitShift(ctor.id)
  }

  getFreeComponent<C extends Component>(ctor: ComponentConstructor<C>, data?: ComponentData<C>): C {
    const pool = this.pools.get(ctor)
    if(pool){
      return pool.get()._reset(data) as C
    }
    throw new Error(`Ein: [component manager] - component '${ctor.name}' not registered. (${ctor.id})`)
  }

  freeComponent<C extends Component>(instance: ComponentInstance<C>){
    const pool = this.pools.get(instance.constructor as ComponentConstructor)
    if(pool){
      pool.free(instance as C)
    }
  }

  private nextComponentId(){
    return ++this.componentId
  }

}
