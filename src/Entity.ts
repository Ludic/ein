import { Klass } from "./Klass"
import { Component, ComponentData } from "./Component"
import { EntityManager } from "./EntityManager"
import { Engine } from "./Engine"

var next_id = 0

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

  addComponent<C extends Component>(component_class: Klass<C>, data?: ComponentData<C>): this {
    this.engine.component_manager.addComponent(this, component_class, data)
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
