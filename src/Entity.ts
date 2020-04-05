import { Klass, Component, TransferableComponent, EntityManager, Engine } from './'
import { v4 as uuid } from 'uuid'

let next_id: number = 0

export class Entity {
  id: string
  active: boolean
  name: string

  components: Component[]
  component_class_names: string[]
  class_to_component: {[key: string]: Component}
  id_to_component: {[key: number]: Component}

  constructor(name: string = "default_name") {
    this.id = uuid()
    this.name = name
    this.active = true

    this.components = []
    this.component_class_names = []
    this.class_to_component = {}
    this.id_to_component = {}
  }

  addComponent(component_class: Klass<Component>, data: any): Entity {
    // If the Entity already has this Component, return
    if(this.class_to_component[component_class.name]) return this

    let component = new component_class(data)
    this.class_to_component[component_class.name] = component
    this.id_to_component[component.id] = component
    this.components.push(component)

    // TODO notify a component was added to this entity

    return this
  }

  // removeComponent(component_class: Klass<Component>): Entity {
  //   this.entity_manager.removeComponent(this, component_class)
  //   return this
  // }


  // getComponent(component_class: Klass<Component>): Component | undefined {
  //   return this.class_to_component.get(component_class)
  // }

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
