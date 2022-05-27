import { Component, ComponentConstructor } from './Component'
import { ComponentManager } from './ComponentManager'
import { Entity } from './Entity'
import { EntityManager } from './EntityManager'
import { System } from './System'
import { Query, QueryOptions } from './Query'
import { Klass } from './Klass'
import { Engine } from './Engine'
import { isArray, setIntersection, setDifference, performance } from './Utils'
import { ReactiveEffect } from '@vue/reactivity'

export class QueryManager {
  queries: Set<Query> = new Set()
  // query_to_entities: Map<Query, Entity[]>

  engine: Engine

  pendingUpdates: Set<ReactiveEffect> = new Set()

  constructor(engine: Engine){
    this.engine = engine
    // this.query_to_entities = new Map()
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

  createQuery<C extends Component>(options: QueryOptions): Query<C> {
    const query = new Query(options)
    // this.updateQuery(query)

    // query.update = effect(()=>{
    //   console.log('update query', query)
    //   this.updateQuery(query)
    // }, {
    //   scheduler: (job) => {
    //     this.pendingUpdates.add(job)
    //   },
    //   onTrack(e){
    //     console.log('on track:', e)
    //   },
    //   onTrigger(e){
    //     console.log('on trigger:', e)
    //   },
    // })
    this.queries.add(query)
    return query as unknown as Query<C>
  }

  updateQuery(query: Query){
    // query.clear()
    // this.engine.entity_manager.entities.forEach((entity)=>{
    //   if(query.matches(entity)){
    //     query.add(entity)
    //   }
    // })
    query.reset()
    for(let entity of this.engine.entity_manager.entities){
      if(query.matches(entity)){
        query.add(entity)
      } else {
        // console.log('qm.update', 'remove', entity)
        query.remove(entity)
      }
    }
  }

  update(force: boolean = false){
    if(force){
      // force update all queries
      // console.log('query manager : update', this.queries.size)
      this.queries.forEach((query)=>{
        this.updateQuery(query)
      })
    } else {
      // console.log('querymanager.update', this.pendingUpdates.size)
      this.pendingUpdates.forEach(job => {
        // @ts-ignore
        job()
      })
      this.pendingUpdates.clear()
    }
  }

  // onComponentAdded<C extends Component>(entity: Entity, cls: ComponentConstructor, component: C){
  //   this.queries.forEach((query)=>{
  //     if(query.flush == 'immediate'){
  //       console.log('on comp added', query)
  //       this.updateQuery(query)
  //     }
  //   })
  // }
  onComponentRemoved<C extends Component>(entity: Entity<any>){
    this.queries.forEach((query)=>{
      if(query.matches(entity)){
        query.add(entity)
      } else {
        query.remove(entity)
      }
    })
  }

  onEntityRemoved<C extends Component>(entity: Entity){
    this.queries.forEach((query)=>{
      query.remove(entity)
    })
  }

}
