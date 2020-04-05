import { Component, Entity, Klass, Engine } from "./"

export class ComponentManager {
  component_classes: string[]
  engine: Engine

  constructor(engine: Engine){
    this.engine = engine
    this.component_classes = []
  }

  // get components(): Component[] {
  //   return Array.from(this.name_to_entities.values()).reduce((a: Entity[], i: Entity[])=>a.concat(i), [])
  // }


  componentForEntityByClass(component_class: Klass<Component>, entity: Entity){

  }

  componentAddedToEntity(component_class: Klass<Component>, component: Component, entity: Entity): void {

  }

  componentRemovedFromEntity(component_class: Klass<Component>, entity: Entity): void {

  }
}
