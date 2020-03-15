import { Klass, Component, TransferableComponent, ComponentManager, Entity, EventDispatcher, Engine } from "./"

export class EntityManager {
  entities: Entity[]
  name_to_entities: {[key: string]: Entity[]}

  component_manager: ComponentManager
  event_dispatcher: EventDispatcher
  engine: Engine

  constructor(engine: Engine){
    this.entities = []
    this.name_to_entities = {}

    this.component_manager = engine.component_manager
    this.engine = engine
    this.event_dispatcher = new EventDispatcher()
  }

  createEntity(name: string = ""): Entity {
    // TODO Object pool
    let entity: Entity = new Entity(this, name)

    this.entities.push(entity)
    this.name_to_entities[entity.name] ? this.name_to_entities[entity.name].push(entity) : this.name_to_entities[entity.name] = [entity]

    // TODO, just call other managers directly? or use pub/sub?
    // this.event_dispatcher.dispatchEvent(ENTITY_CREATED, entity)

    return entity
  }

  entitiesByName(name: string): Entity[]{
    return this.name_to_entities[name]
  }

  addComponent(entity: Entity, component_class: Klass<Component>, data: any, is_transferable: boolean = false): Entity {
    // If the Entity already has this Component, return
    if(entity.class_to_component.has(component_class)) return entity

    // TODO don't like this
    let component: Component
    if(is_transferable){
      component = new TransferableComponent(data)
    } else {
      component = new Component(data)
    }

    entity.class_to_component.set(component_class, component)

    // this.component_manager.componentAddedToEntity(component_class)
    // TODO do we want pub/sub, or just direct call?
    // this.event_dispatcher.dispatchEvent(COMPONENT_ADDED, entity, component)

    return entity
  }

  removeComponent(entity: Entity, component_class: Klass<Component>): Entity {
    let component: Component | undefined = entity.class_to_component.get(component_class)

    // If the Entity doesn't have this Component, return
    if(!component) return entity

    // TODO do we want pub/sub, or just direct call?
    // this.event_dispatcher.dispatchEvent(COMPONENT_REMOVE, entity, component)
    entity.class_to_component.delete(component_class)

    return entity
  }

  removeAllComponents(entity: Entity): Entity {
    // TODO, just use entity.component_to_class map Iterator here
    entity.getComponentClasses().forEach((component_class: Klass<Component>)=>{
      this.removeComponent(entity, component_class)
    })

    return entity
  }

  removeEntity(entity: Entity): void {
    const index: number = this.entities.indexOf(entity)
    if(index === -1) throw new Error("Tried to remove entity not in list")
    entity.active = false

    // TODO
    // this.event_dispatcher.dispatchEvent(ENTITY_REMOVED, entity)
    this.entities.splice(index, 1)
  }

  removeAllEntities() {
    for(let i = this.entities.length - 1; i >= 0; i--){
      this.removeEntity(this.entities[i])
    }
  }
}

// See TODO ^
// const ENTITY_CREATED: string = "EntityManager#ENTITY_CREATE"
// const ENTITY_REMOVED: string = "EntityManager#ENTITY_REMOVED"
// const COMPONENT_ADDED: string = "EntityManager#COMPONENT_ADDED"
// const COMPONENT_REMOVE: string = "EntityManager#COMPONENT_REMOVE"
