import { Component, Entity, Engine } from './'

export class Family {
  id: number

  component_classes: string[]
  _entities: Entity[]

  constructor(component_classes: string[]){
    this.component_classes = component_classes
  }

  get entities(): Entity[]{
    return this._entities
  }

  set entities(entities: Entity[]){
    this._entities = entities
  }

}


// // TODO
// export interface Query {
//   component_class: string
//   type: string
// }
