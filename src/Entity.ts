import { Klass } from "./Klass"
import { Component, ComponentData, SingletonComponent } from "./Component"
import { EntityManager } from "./EntityManager"
import { Engine } from "./Engine"

var next_id = 0

// type Abc<C extends Component> = C extends 

export class Entity {
  id: number
  active: boolean
  name: string
  // active: boolean

  engine: Engine

  constructor(engine: Engine, name: string = "") {
    this.$reset(name)
    this.engine = engine
  }

  addComponent<C extends Component>(component_class: Klass<C>, ...data: (C extends SingletonComponent ? [] : [ComponentData<C>])): this {
    // with this conditional typescript syntax we are checking if the type of the 
    // component extends SingletonComponent and removing the `data` parameter from
    // the function. We do this because if we made a traditional override like
    // `addComponent<C extends SingletonComponent>(cls: Klass<C>): this` the normal
    // override with the data param would still be valid because SingletonComponent
    // extends Component as well. We just want to enforce that you should not be passing
    // data with a singleton component class, it should be registered with the engine.
    this.engine.component_manager.addComponent(this, component_class, ...data)
    return this
  }
  
  addReactiveComponent<C extends Component>(component_class: Klass<C>, data?: any): this {
    this.engine.component_manager.addComponent(this, component_class, data, true)
    return this
  }

  removeComponent<C extends Component>(component_class: Klass<C>): this {
    this.engine.component_manager.removeComponent(this, component_class)
    return this
  }

  getComponent<C extends Component>(component_class: Klass<C>): C|undefined {
    return this.engine.component_manager.componentForEntity(this, component_class)
  }

  getComponents(): Component[] {
    return this.engine.component_manager.componentsForEntity(this)
  }

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
    this.id = next_id++
    this.name = name
    this.active = true
  }

}
