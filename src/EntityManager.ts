import { Klass } from './Klass'
import { Component } from './Component'
import { ComponentManager } from './ComponentManager'
import { Entity } from './Entity'
import { EventDispatcher } from './EventDispatcher'
import { Engine } from './Engine'
import Pool from './pool'
import { reactive } from './reactivity'
import { shallowReactive, isReactive } from '@vue/reactivity'

export class EntityManager {
  entities: Set<Entity> = new Set()
  nameToEntities: Map<string, Set<Entity>> = reactive(new Map())
  idToEntity: Map<number, Entity> = shallowReactive(new Map())

  engine: Engine
  pool: Pool<Entity>

  constructor(engine: Engine){
    this.pool = new Pool(()=>new Entity(engine))
    this.engine = engine
  }

  createEntity(name?: string): Entity {
    let entity = this.pool.get()
    entity.$reset(name)
    this.addEntity(entity)
    return entity
  }

  private addEntity(entity: Entity){
    this.entities.add(entity)
    this.idToEntity.set(entity.id, entity)
    this.getEntitiesForName(entity.name).add(entity)
  }

  deleteEntity(entity: Entity){
    this.removeEntity(entity)
    this.pool.free(entity)
  }

  private removeEntity(entity: Entity){
    this.entities.delete(entity)
    this.idToEntity.delete(entity.id)
    this.nameToEntities.get(entity.name)?.delete(entity)
  }

  getEntitiesForName(name: string){
    let entities = this.nameToEntities.get(name)
    if(!entities){
      entities = shallowReactive(new Set()) as Set<Entity>
      this.nameToEntities.set(name, entities)
    }
    return entities
  }

  // addComponentToEntity(entity: Entity, component_class: Klass<Component>, data: any): Entity {
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

  removeAllEntities(){
    // TODO
  }


  // TODO - see below
  // syncEntities(entities: Entity[]): void {
  //   entities.forEach((entity: Entity)=>{
  //     let e: Entity = this.id_to_entity[entity.id]
  //     if(e == null){
  //       this.addEntity(entity)
  //     } else {
  //       e.components.forEach((c: Component)=>{
  //         c.data = entity.class_to_component[c.class_name].data
  //       })
  //     }
  //   })
  // }


  // syncEntitiesTODO(current_frame_entities: Entity[], next_frame_entities: Entity[]): void {
  //   // Smart Diff here
  // }
}
