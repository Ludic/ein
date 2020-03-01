import { Component } from './Component'

export class ComponentManager {
  component_classes: string[]

  constructor(){
    this.component_classes = []
  }

  registerComponent(component_class: string): void {
    if(this.component_classes.includes(component_class)){
      console.warn(`'${component_class}' already registered.`)
      return
    }
    this.component_classes.push(component_class)
  }

  componentAddedToEntity(component_class: string): void {
    if(!this.component_classes.includes(component_class)){
      this.registerComponent(component_class)
    }
  }

  componentRemovedFromEntity(component_class: string): void {

  }
}
