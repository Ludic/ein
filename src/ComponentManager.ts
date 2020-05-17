import { Component } from "./Component"
import { Entity } from "./Entity"
import { Klass } from "./Klass"
import { Engine } from "./Engine"

export class ComponentManager {
  components: Component[]
  class_name_to_components: {[key: string]: Component[]}
  id_to_component: {[key: string]: Component}

  hash_to_component: {[key: string]: Component}
  entity_id_to_components: {[key: string]: Component[]}


  engine: Engine

  constructor(engine: Engine){
    this.components = []
    this.class_name_to_components = {}
    this.id_to_component = {}

    this.hash_to_component = {}
    this.entity_id_to_components = {}

    this.engine = engine
  }

  addComponent(entity: Entity, klass: Klass<Component>, data: any = {}): Component {
    // TODO Object pool
    // TODO Operation pool (bundle operations to be done later)
    let component: Component = new klass(data)
    this.components.push(component)
    this.class_name_to_components[component.class_name] ? this.class_name_to_components[component.class_name].push(component) : this.class_name_to_components[component.class_name] = [component]
    this.id_to_component[component.id] = component

    const hash: string = entity.id + component.class_name
    this.hash_to_component[hash] = component
    this.entity_id_to_components[entity.id] ? this.entity_id_to_components[entity.id].push(component) : this.entity_id_to_components[entity.id] = [component]

    return component
  }

  removeComponent(entity: Entity, klass: Klass<Component>): void {
    const hash: string = entity.id + klass.name
    const component = this.hash_to_component[hash]

    if(component){
      delete this.id_to_component[component.id]
      this.class_name_to_components[component.class_name].splice(this.class_name_to_components[component.class_name].indexOf(component), 1)
      this.components.splice(this.components.indexOf(component), 1)

      delete this.hash_to_component[hash]
      this.entity_id_to_components[entity.id].splice(this.entity_id_to_components[entity.id].indexOf(component), 1)

    } else {
      throw "ComponentManager.removeComponent(): Component not found"
    }
  }

  componentsForEntityId(entity_id: number): Component[] {
    return this.entity_id_to_components[entity_id]
  }

  componentForEntity<T>(entity_id: number, class_name: string): Component {
    return this.hash_to_component[entity_id+class_name]
  }

}
