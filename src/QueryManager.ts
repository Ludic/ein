import { Component } from './Component'
import { ComponentManager } from './ComponentManager'
import { Entity } from './Entity'
import { EntityManager } from './EntityManager'
import { System } from './System'
import { Query, QueryOptions } from './Query'
import { Klass } from './Klass'
import { Engine } from './Engine'
import { effect, ReactiveEffect } from './reactivity'
import { isArray, setIntersection, setDifference } from './Utils'

export class QueryManager {
  queries: Query[]
  query_to_entities: Map<Query, Entity[]>

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
      query.entities = Array.from(this.engine.entity_manager.getEntitiesForName(query._options.name) || [])
    } else if(Query.isComponentsQuery(query)){
      // let entities: Set<Entity> = new Set()

      const withComponentsSets = (
        isArray(query._options.components)
          ? query._options.components
          : query._options.components.include || []
      ).sort((compA, compB) => this.engine.component_manager.getEntitiesForComponent(compA).size - this.engine.component_manager.getEntitiesForComponent(compB).size)
      .map(comp => this.engine.component_manager.getEntitiesForComponent(comp))

      const notWithComponentsSets = (
        isArray(query._options.components)
          ? []
          : query._options.components.exclude || []
      ).sort((compA, compB) => this.engine.component_manager.getEntitiesForComponent(compA).size - this.engine.component_manager.getEntitiesForComponent(compB).size)
      .map(comp => this.engine.component_manager.getEntitiesForComponent(comp))

      const entities: Set<Entity> = withComponentsSets
        // the initial value is the first set in the list (the largest set)
        // or the set of all entities since we were given no filters
        .reduce((setA, setB) => setIntersection(setA, setB), withComponentsSets[0] || new Set())

      const notEntities: Set<Entity> = notWithComponentsSets
        // the initial value is the first set in the list (the largest set)
        // or an empty set since we will be doing a difference with the entities above
        .reduce((setA, setB) => setIntersection(setA, setB), notWithComponentsSets[0] || new Set())

      // query.entities = [...setDifference(entities, notEntities)]

      notEntities.forEach(ent => entities.delete(ent))

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
