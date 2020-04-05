import { Klass, Component, TransferableComponent, ComponentManager, Entity, EventDispatcher, Engine } from "./"

export class EntityManager {
  entities: Entity[]
  name_to_entities: {[key: string]: Entity[]}
  id_to_entity: {[key: string]: Entity}

  engine: Engine

  constructor(engine: Engine){
    // TODO object.freeze?
    this.entities = []
    this.name_to_entities = {}
    this.id_to_entity = {}

    this.engine = engine
  }

  createEntity(name: string = ""): Entity {
    // TODO Object pool
    let entity: Entity = new Entity(name)
    this.addEntity(entity)
    return entity
  }

  private addEntity(entity: Entity){
    this.entities.push(entity)
    this.id_to_entity[entity.id] = entity
    if(this.name_to_entities[entity.name]){
      this.name_to_entities[entity.name].push(entity)
    } else {
      this.name_to_entities[entity.name] = [entity]
    }
  }

  // addComponent(entity: Entity, component_class: Klass<Component>, data: any, is_transferable: boolean = false): Entity {
  //   // If the Entity already has this Component, return
  //   if(entity.class_to_component.has(component_class)) return entity

  //   // TODO don't like this
  //   let component: Component
  //   if(is_transferable){
  //     component = new TransferableComponent(data)
  //   } else {
  //     component = new Component(data)
  //   }

  //   entity.class_to_component.set(component_class, component)
  //   // this.engine.component_manager.componentAddedToEntity(component_class, component, entity)

  //   return entity
  // }

  // removeComponent(entity: Entity, component_class: Klass<Component>): Entity {
  //   let component: Component | undefined = entity.class_to_component.get(component_class)

  //   // If the Entity doesn't have this Component, return
  //   if(!component) return entity

  //   entity.class_to_component.delete(component_class)
  //   return entity
  // }

  // removeAllComponents(entity: Entity): Entity {
  //   // TODO, just use entity.component_to_class map Iterator here
  //   entity.getComponentClasses().forEach((component_class: Klass<Component>)=>{
  //     this.removeComponent(entity, component_class)
  //   })

  //   return entity
  // }

  removeEntity(entity: Entity): void {
    // TODO
  }

  removeAllEntities(){
    // TODO
  }


  // TODO - see below
  syncEntities(entities: Entity[]): void {
    entities.forEach((entity: Entity)=>{
      let e: Entity = this.id_to_entity[entity.id]
      if(e == null){
        this.addEntity(entity)
      } else {
        e.components.forEach((c: Component)=>{
          c.data = entity.class_to_component[c.class_name].data
        })
      }
    })
  }


  syncEntitiesTODO(current_frame_entities: Entity[], next_frame_entities: Entity[]): void {
    // Smart Diff here
  }
}
