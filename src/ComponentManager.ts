import { Component } from "./Component"
import { Entity } from "./Entity"
import { Klass } from "./Klass"
import { Engine } from "./Engine"
import { reactive, shallowReactive } from '@vue/reactivity'

export class ComponentManager {
  components: Set<Component> = new Set()
  nameToComponents: Map<string, Set<Component>> = new Map()
  idToComponent: Map<number, Component> = new Map()
  hashToComponent: Map<string, Component> = new Map()
  entityToComponents: WeakMap<Entity, Set<Component>> = new WeakMap()
  entityToComponent: WeakMap<Entity, WeakMap<Klass<Component>, Component>> = new WeakMap()
  componentToEntities: WeakMap<Klass<Component>, Set<Entity>> = new WeakMap()

  engine: Engine

  constructor(engine: Engine){
    this.engine = engine
  }

  addComponent(entity: Entity, klass: Klass<Component>, data?: any, isReactive: boolean = false): Component {
    // TODO Object pool
    // TODO Operation pool (bundle operations to be done later)
    // let component: Component = isReactive ? reactive(new klass(data)) : new klass(data)
    let component: Component = Reflect.construct(klass, [data])
    this.components.add(component)
    this.nameToComponents.has(component._name) ? this.nameToComponents.get(component._name)?.add(component) : this.nameToComponents.set(component._name, new Set([component]))
    this.idToComponent.set(component._id, component)

    const hash: string = entity.id + component._name
    this.hashToComponent.set(hash, component)
    this.entityToComponents.has(entity) ? this.entityToComponents.get(entity)?.add(component) : this.entityToComponents.set(entity, new Set([component]))
    this.entityToComponent.has(entity) ? this.entityToComponent.get(entity)?.set(klass, component) : this.entityToComponent.set(entity, new WeakMap([[klass, component]]))
    // this.componentToEntities.has(klass) ? this.componentToEntities.get(klass)?.add(entity) : this.componentToEntities.set(klass, new Set([entity]))
    this.getEntitiesForComponent(klass).add(entity)

    return component
  }

  removeComponent(entity: Entity, klass: Klass<Component>): void {
    const hash: string = entity.id + klass.name
    const component = this.hashToComponent.get(hash)

    if(component){
      this.idToComponent.delete(component._id)
      this.nameToComponents.get(component._name)?.delete(component)
      this.components.delete(component)

      this.hashToComponent.delete(hash)
      this.entityToComponents.get(entity)?.delete(component)
      this.entityToComponent.get(entity)?.delete(klass)
      this.componentToEntities.get(klass)?.delete(entity)

    } else {
      throw "ComponentManager.removeComponent(): Component not found"
    }
  }

  componentsForEntity(entity: Entity): Component[] {
    return Array.from(this.entityToComponents.get(entity) || [])
  }

  componentForEntity<C extends Component>(entity: Entity, klass: Klass<C>): C|undefined {
    return this.entityToComponent.get(entity)?.get(klass) as C
  }

  getEntitiesForComponent(klass: Klass<Component>){
    let entities = this.componentToEntities.get(klass)
    if(!entities){
      entities = shallowReactive(new Set()) as Set<Entity>
      this.componentToEntities.set(klass, entities)
    }
    return entities
  }

}
