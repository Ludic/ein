import { Klass, Component, TransferableComponent, EntityManager, Engine } from './'

let next_id: number = 0

export class Entity {
  id: number
  active: boolean
  name: string

  class_to_component: Map<Klass<Component>, Component>
  entity_manager: EntityManager

  constructor(entity_manager: EntityManager, name: string = "") {
    this.id = next_id++
    this.name = name
    this.active = true

    this.class_to_component = new Map()
    this.entity_manager = entity_manager
  }

  get components(): Component[] {
    return Array.from(this.class_to_component.values())
  }

  get transferableComponents(): TransferableComponent[] {
    // @ts-ignore
    return Array.from(this.class_to_component.values()).filter((component: Component)=>(component instanceof TransferableComponent))
  }

  addComponent(component_class: Klass<Component>, data: any, is_transferable: boolean = false): Entity {
    this.entity_manager.addComponent(this, component_class, data, is_transferable)
    return this
  }

  getComponent(component_class: Klass<Component>): Component | undefined {
    return this.class_to_component.get(component_class)
  }

  getComponentClasses(): Klass<Component>[] {
    return Array.from(this.class_to_component.keys())
  }

  getComponents(): Component[] {
    return Array.from(this.class_to_component.values())
  }

  removeComponent(component_class: Klass<Component>): Entity {
    this.entity_manager.removeComponent(this, component_class)
    return this
  }

  hasComponent(component_class: Klass<Component>): boolean {
    return this.getComponentClasses().includes(component_class)
  }

  hasAllComponents(component_classes: Klass<Component>[]): boolean {
    for(let i = 0; i < component_classes.length; i++){
      if(!this.hasComponent(component_classes[i])) return false
    }
    return true
  }

  hasAnyComponents(component_classes: Klass<Component>[]): boolean {
    for(let i = 0; i < component_classes.length; i++){
      if(this.hasComponent(component_classes[i])) return true
    }
    return false
  }

  removeAllComponents(){
    return this.entity_manager.removeAllComponents(this)
  }

  remove(): void {
    return this.entity_manager.removeEntity(this)
  }

  toTransferable(): any {
    return JSON.stringify({
      id: 1,
      components: this.transferableComponents.map((component: TransferableComponent)=>component.transferable_data)
    })
  }

  fromTransferable(data: any): any {
    JSON.parse(data)
  }

}
