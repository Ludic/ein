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
  pendingEntities: Set<Entity> = new Set()

  constructor(engine: Engine){
    this.engine = engine
    // this.query_to_entities = new Map()
  }

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
    query.reset()
    query.update(this.pendingEntities)
  }

  update(){
    this.queries.forEach((query)=>{
      this.updateQuery(query)
    })
    this.pendingEntities.clear()
  }

  onComponentAdded<C extends Component>(entity: Entity, cls: ComponentConstructor<C>){
    this.pendingEntities.add(entity)
  }
  onComponentRemoved(entity: Entity<any>){
    this.pendingEntities.add(entity)
    // this.queries.forEach((query)=>{
    //   if(query.matches(entity)){
    //     query.add(entity)
    //   } else {
    //     query.remove(entity)
    //   }
    // })
  }

  onEntityAdded(entity: Entity){
    this.pendingEntities.add(entity)
    // this.queries.forEach((query)=>{
    //   if(query.matches(entity)){
    //     query.add(entity)
    //   }
    // })
  }
  
  onEntityRemoved(entity: Entity){
    this.pendingEntities.add(entity)
    // this.queries.forEach((query)=>{
    //   query.remove(entity)
    // })
  }

}
