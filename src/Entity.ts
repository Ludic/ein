import { Klass } from "./Klass"
import { Component, ComponentConstructor, ComponentData, ComponentInstance } from "./Component"
import { EntityManager } from "./EntityManager"
import { Engine } from "./Engine"
import { bitDel, bitSet } from './Utils'
import { COMPONENT_ENTITY_ID_MAP, ENTITY_ID_COMPONENT_MAP, TAG_ENTITY_ID_MAP } from './shared'

var next_id = 0

export class Entity<All extends Component=any> {
  mask!: number
  id!: number
  active!: boolean
  name!: string
  // active: boolean

  private engine: Engine

  // components: WeakMap<ComponentConstructor, Component> = new WeakMap()
  // private $components: Map<ComponentConstructor, Component> = new Map()
  // private $componentsById: {[key: number]: Component} = {}

  constructor(engine: Engine, name: string = "") {
    this.$reset(name)
    this.engine = engine
  }

  // addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  // addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

  
  add<C extends Component>(cls: ComponentConstructor<C>, data?: ComponentData<C>): this {
    // this.engine.component_manager.addComponent(this, cls, ...data)
    const instance = this.engine.component_manager.getFreeComponent(cls, data)
    this.engine.query_manager.onComponentAdded(this, cls)

    this.mask = bitSet(this.mask, cls.mask)
    // this.$components.set(cls, instance)
    // this.$componentsById[cls.id] = instance
    // addComponent(cls, this.id, instance)
    if(cls.name == 'PlayerComponent'){
      console.log('add PlayerComponent')
    }
    const map = COMPONENT_ENTITY_ID_MAP.get(cls) ?? new Map()
    COMPONENT_ENTITY_ID_MAP.set(cls, map)
    map.set(this.id, instance)
    
    const set = ENTITY_ID_COMPONENT_MAP.get(this.id) ?? new Set()
    ENTITY_ID_COMPONENT_MAP.set(this.id, set)
    set.add(cls)

    return this
  }

  remove<C extends Component>(cls: ComponentConstructor<C>): this {
    // this.engine.component_manager.removeComponent(this, component_class)
    this.engine.query_manager.onComponentRemoved(this)
    this.mask = bitDel(this.mask, cls.mask)
    // this.freeComponent(this.$components.get(cls))
    // this.$components.delete(cls)
    const val = COMPONENT_ENTITY_ID_MAP.get(cls)?.get(this.id)
    COMPONENT_ENTITY_ID_MAP.get(cls)?.delete(this.id)
    ENTITY_ID_COMPONENT_MAP.get(this.id)?.delete(cls)
    this.freeComponent(val)
    return this
  }

  get<C extends Component>(cls: ComponentConstructor<C>): C extends All ? ComponentInstance<C> : Required<ComponentInstance<C>>|undefined {
    // return this.$components.get(cls) as C
    return COMPONENT_ENTITY_ID_MAP.get(cls)?.get(this.id) as any
  }

  has<C extends Component>(cls: ComponentConstructor<C>): boolean {
    return !!COMPONENT_ENTITY_ID_MAP.get(cls)?.has(this.id)
  }

  tag(tag: string): this {
    const entityIdSet = TAG_ENTITY_ID_MAP.get(tag) ?? new Set()
    if(!TAG_ENTITY_ID_MAP.has(tag)){
      TAG_ENTITY_ID_MAP.set(tag, entityIdSet)
    }
    entityIdSet.add(this.id)
    return this
  }

  untag(tag: string): this {
    TAG_ENTITY_ID_MAP.get(tag)?.delete(this.id)
    return this
  }

  is(tag: string): boolean {
    return TAG_ENTITY_ID_MAP.get(tag)?.has(this.id) ?? false
  }

  $reset(name: string = ''){
    this.mask = 0
    this.id = next_id++
    this.name = name
    this.active = true
    this.clearComponents()
  }

  private freeComponent<C extends Component>(instance: C|undefined){
    if(instance){
      this.engine.component_manager.freeComponent(instance)
    }
  }

  private clearComponents(){
    COMPONENT_ENTITY_ID_MAP.forEach((map)=>{
      const inst = map.get(this.id)
      this.freeComponent(inst)
      map.delete(this.id)
    })
    ENTITY_ID_COMPONENT_MAP.set(this.id, new Set())
    // also clear tags
    TAG_ENTITY_ID_MAP.forEach(tags => {
      tags.delete(this.id)
    })
  }

  serialize(){
    const obj: {[name: string]: any} = {}
    const set = ENTITY_ID_COMPONENT_MAP.get(this.id)
    if(set){
      set.forEach((cls)=>{
        const inst = COMPONENT_ENTITY_ID_MAP.get(cls)?.get(this.id)
        obj[cls.name] = inst?.serialize()
      })
    }
    return {
      id: this.id,
      components: obj,
    }
  }

}
