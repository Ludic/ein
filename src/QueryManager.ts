import { Component } from './Component'
import { ComponentManager } from './ComponentManager'
import { Entity } from './Entity'
import { EntityManager } from './EntityManager'
import { System } from './System'
import { Query, QueryOptions } from './Query'
import { EventDispatcher } from './EventDispatcher'
import { Klass } from './Klass'
import { Engine } from './Engine'
import { effect, ReactiveEffect } from './reactivity'
import { isArray } from './Utils'

export class QueryManager {
  queries: Query[]
  query_to_entities: Map<Query, Entity[]>

  event_dispatcher: EventDispatcher
  engine: Engine

  pendingUpdates: Set<ReactiveEffect> = new Set()

  constructor(engine: Engine){
    this.engine = engine

    this.queries = []
    this.query_to_entities = new Map()
  }

  // entitiesForQuery(query: Query): Entity[] {
  //   if(this.query_to_entities.has(query)){
  //     return this.query_to_entities.get(query)!
  //   }
  //   if(query.entity_name){
  //     let entities: Entity[] | undefined = this.engine.entity_manager.name_to_entities[query.entity_name]
  //     if(!!entities){
  //       this.query_to_entities.set(query, entities)
  //     } else {
  //       this.engine.entity_manager.name_to_entities[query.entity_name] = []
  //       entities = this.engine.entity_manager.name_to_entities[query.entity_name]
  //       this.query_to_entities.set(query, entities!)
  //     }
  //     return entities!
  //   } else {
  //     return []
  //   }
  // }

  createQuery(options: QueryOptions): Query {
    const query = new Query(options)

    query.update = effect(()=>{
      this.updateQuery(query)
    }, {
      scheduler: (job) => {
        this.pendingUpdates.add(job)
      },
      // onTrack(e){
      //   console.log('on track:', e)
      // },
      // onTrigger(e){
      //   console.log('on trigger:', e)
      // },
    })
    this.queries.push(query)
    return query
  }

  updateQuery(query: Query){
    if(Query.isNameQuery(query)){
      // TODO: use this when vue bug is fixed https://github.com/vuejs/vue-next/issues/1210
      // query.entities = Array.from(this.engine.entity_manager.getEntitiesForName(query._options.name) || [])
      
      // TEMP:
      query.entities = []
      this.engine.entity_manager.getEntitiesForName(query._options.name).forEach(ent => query.entities.push(ent))

    } else if(Query.isComponentsQuery(query)){
      const entities: Set<Entity> = new Set()

      const addComponents = isArray(query._options.components)
        ? query._options.components
        : query._options.components.include || []

      const removeComponents = isArray(query._options.components)
        ? []
        : query._options.components.exclude || []

      addComponents.forEach(comp => {
        this.engine.component_manager.getEntitiesForComponent(comp).forEach(ent => {
          entities.add(ent)
        })
      })

      removeComponents.forEach(comp => {
        this.engine.component_manager.getEntitiesForComponent(comp).forEach(ent => {
          entities.delete(ent)
        })
      })

      query.entities = [...entities]
    }
  }

  update(){
    this.pendingUpdates.forEach(job => {
      job()
    })
    this.pendingUpdates.clear()
  }

}
