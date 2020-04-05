import {
  Klass,
  Component,
  ComponentManager,
  Entity,
  EntityManager,
  EventDispatcher,
  System,
  Engine,
  Query
} from "./"

export class QueryManager {
  queries: Query[]
  query_to_entities: Map<Query, Entity[]>

  event_dispatcher: EventDispatcher
  engine: Engine

  constructor(engine: Engine){
    this.engine = engine

    this.queries = []
    this.query_to_entities = new Map()
  }

  entitiesForQuery(query: Query): Entity[] {
    if(this.query_to_entities.has(query)){
      return this.query_to_entities.get(query)!
    }
    if(query.entity_name){
      let entities: Entity[] | undefined = this.engine.entity_manager.name_to_entities[query.entity_name]
      if(!!entities){
        this.query_to_entities.set(query, entities)
      } else {
        this.engine.entity_manager.name_to_entities[query.entity_name] = []
        entities = this.engine.entity_manager.name_to_entities[query.entity_name]
        this.query_to_entities.set(query, entities!)
      }
      return entities!
    } else {
      return []
    }
  }

}
