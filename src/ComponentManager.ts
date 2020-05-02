import { Component, Entity, Klass, Engine } from "./"

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

  addComponentToEntity(entity: Entity, klass: Klass<Component>, data: any = {}): Component {
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

  componentsForEntityId(entity_id: string): Component[] {
    return this.entity_id_to_components[entity_id]
  }

  componentForEntity<T>(entity_id: string, class_name: string): Component {
    return this.hash_to_component[entity_id+class_name]
  }

}
