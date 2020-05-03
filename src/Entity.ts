import { Klass, Component, EntityManager, Engine } from './'
import { v4 as uuid } from 'uuid'

export class Entity {
  id: string
  active: boolean
  name: string

  engine: Engine

  constructor(engine: Engine, name: string = "") {
    this.id = uuid()
    this.name = name
    this.active = true

    this.engine = engine
  }

  addComponent(component_class: Klass<Component>, data?: any): Entity {
    this.engine.component_manager.addComponent(this, component_class, data)
    return this
  }

  removeComponent(component_class: Klass<Component>): Entity {
    this.engine.component_manager.removeComponent(this, component_class)
    return this
  }

  getComponent(component_class: Klass<Component>): Component {
    return this.engine.component_manager.componentForEntity(this.id, component_class.name)
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

}
