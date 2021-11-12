import { Klass } from "./Klass"
import { Component, ComponentConstructor, ComponentData, ComponentInstance } from "./Component"
import { EntityManager } from "./EntityManager"
import { Engine } from "./Engine"
import { bitDel, bitSet } from './Utils'

var next_id = 0

export class Entity<All extends Component=Component> {
  mask: number
  id: number
  active: boolean
  name: string
  // active: boolean

  private engine: Engine

  // components: WeakMap<ComponentConstructor, Component> = new WeakMap()
  // private $components: Map<ComponentConstructor, Component> = new Map()
  private $componentsById: {[key: number]: Component} = {}

  constructor(engine: Engine, name: string = "") {
    this.$reset(name)
    this.engine = engine
  }

  // addEventListener<K extends keyof WindowEventMap>(type: K, listener: (this: Window, ev: WindowEventMap[K]) => any, options?: boolean | AddEventListenerOptions): void;
  // addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;

  
  addComponent<C extends Component>(cls: ComponentConstructor<C>, data?: ComponentData<C>): this {
    // this.engine.component_manager.addComponent(this, cls, ...data)
    const instance = this.engine.component_manager.getFreeComponent(cls, data)

    this.mask = bitSet(this.mask, cls.mask)
    // this.$components.set(cls, instance)
    this.$componentsById[cls.id] = instance

    return this
  }

  removeComponent<C extends Component>(cls: ComponentConstructor<C>): this {
    // this.engine.component_manager.removeComponent(this, component_class)
    this.mask = bitDel(this.mask, cls.mask)
    // this.freeComponent(this.$components.get(cls))
    // this.$components.delete(cls)
    this.freeComponent(this.$componentsById[cls.id])
    delete this.$componentsById[cls.id]
    return this
  }

  getComponent<C extends Component>(cls: ComponentConstructor<C>): C extends All ? ComponentInstance<C> : ComponentInstance<C>|undefined {
    // return this.$components.get(cls) as C
    return this.$componentsById[cls.id] as any
  }

  hasComponent<C extends Component>(cls: ComponentConstructor<C>): boolean {
    return cls.id in this.$componentsById
  }

  private freeComponent<C extends Component>(instance: C|undefined){
    if(instance){
      this.engine.component_manager.freeComponent(instance)
    }
  }

  // getComponents(): Component[] {
  //   return this.engine.component_manager.componentsForEntity(this)
  // }

  // TODO
  // getComponentClasses(): Klass<Component>[] {
  //   this.class_to_component.keys())
  // }

  // getComponents(): Component[] {
  //   return Array.from(this.class_to_component.values())
  // }


  // hasComponent(component_class: Klass<Component>): boolean {
  //   return this.getComponentClasses().includes(component_class)
  // }

  // hasAllComponents(component_classes: Klass<Component>[]): boolean {
  //   for(let i = 0; i < component_classes.length; i++){
  //     if(!this.hasComponent(component_classes[i])) return false
  //   }
  //   return true
  // }

  // hasAnyComponents(component_classes: Klass<Component>[]): boolean {
  //   for(let i = 0; i < component_classes.length; i++){
  //     if(this.hasComponent(component_classes[i])) return true
  //   }
  //   return false
  // }

  // removeAllComponents(){
  //   return this.entity_manager.removeAllComponents(this)
  // }

  // remove(): void {
  //   return this.entity_manager.removeEntity(this)
  // }

  $reset(name: string = ''){
    this.mask = 0
    this.id = next_id++
    this.name = name
    this.active = true
    this.clearComponents()
  }

  private clearComponents(){
    // this.$components.forEach((instance)=>{
    //   this.freeComponent(instance)
    // })
    // this.$components.clear()
    Object.values(this.$componentsById).forEach((c)=>{
      this.freeComponent(c)
    })
    this.$componentsById = {}
  }

  serialize(){
    return {
      id: this.id,
      components: Object.fromEntries(Object.entries(this.$componentsById).map(([id, component])=>{
        return [
          component.constructor.name,
          component.serialize(),
        ]
      }))
    }
  }

}
