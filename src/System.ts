// [[file:~/repos/mine/README.org::*System][System:1]]
import { Klass } from './Klass'
import { Component } from './Component'
import { Entity } from './Entity'
import { Engine } from './Engine'
import { Query } from "./Query"

export class System {
  engine: Engine
  enabled: boolean
  _queries: {[key: string]: Query}
  queries: any
  priority: number
  executeTime: number
  mandatoryQueries: any[]
  initialized: boolean
  order: any
  todo_queries: any

  constructor(todo_queries: any, priority: number = 0) {
    this.enabled = true

    // @todo Better naming :)
    this._queries = {}
    this.queries = {}
    this.todo_queries = todo_queries

    // Used for stats
    this.executeTime = 0

    this.priority = priority

    this.mandatoryQueries = []

    this.initialized = true
  }

  initQueries(){
    // @ts-ignore
    if(this.todo_queries) {
      // @ts-ignore
      for(let queryName in this.todo_queries) {
        // @ts-ignore
        let queryConfig = this.todo_queries[queryName]
        let Components = queryConfig.components
        if (!Components || Components.length === 0) {
          throw new Error("'components' attribute can't be empty in a query")
        }

        let query = this.engine.entityManager.queryComponents(Components)

        this._queries[queryName] = query
        if (queryConfig.mandatory === true) {
          this.mandatoryQueries.push(query)
        }

        this.queries[queryName] = {
          results: query.entities
        }

        // Reactive configuration added/removed/changed
        let validEvents = ["added", "removed", "changed"]

        const eventMapping = {
          // @ts-ignore
          added: Query.prototype.ENTITY_ADDED,
          // @ts-ignore
          removed: Query.prototype.ENTITY_REMOVED,
          // @ts-ignore
          changed: Query.prototype.COMPONENT_CHANGED // Query.prototype.ENTITY_CHANGED
        }

        if (queryConfig.listen) {
          validEvents.forEach(eventName => {
            // Is the event enabled on this system's query?
            if (queryConfig.listen[eventName]) {
              let event = queryConfig.listen[eventName]

              if (eventName === "changed") {
                query.reactive = true
                if (event === true) {
                  // Any change on the entity from the components in the query
                  let eventList = (this.queries[queryName][eventName] = [])
                  query.eventDispatcher.addEventListener(
                    // @ts-ignore
                    Query.prototype.COMPONENT_CHANGED,
                    (entity: Entity) => {
                      // Avoid duplicates
                      // @ts-ignore
                      if (eventList.indexOf(entity) === -1) {
                        // @ts-ignore
                        eventList.push(entity)
                      }
                    }
                  )
                } else if (Array.isArray(event)) {
                  let eventList = (this.queries[queryName][eventName] = [])
                  query.eventDispatcher.addEventListener(
                    // @ts-ignore
                    Query.prototype.COMPONENT_CHANGED,
                    // @ts-ignore
                    (entity, changedComponent) => {
                      // Avoid duplicates
                      if (
                        event.indexOf(changedComponent.constructor) !== -1 &&
                          // @ts-ignore
                          eventList.indexOf(entity) === -1
                      ) {
                        // @ts-ignore
                        eventList.push(entity)
                      }
                    }
                  )
                } else {
                  /*
                  // Checking just specific components
                  let changedList = (this.queries[queryName][eventName] = {})
                  event.forEach(component => {
                  let eventList = (changedList[
                  componentPropertyName(component)
                  ] = [])
                  query.eventDispatcher.addEventListener(
                  Query.prototype.COMPONENT_CHANGED,
                  (entity, changedComponent) => {
                  if (
                  changedComponent.constructor === component &&
                  eventList.indexOf(entity) === -1
                  ) {
                  eventList.push(entity)
                  }
                  }
                  )
                  })
                  */
                }
              } else {
                let eventList = (this.queries[queryName][eventName] = [])

                query.eventDispatcher.addEventListener(
                  // @ts-ignore
                  eventMapping[eventName],
                  // @ts-ignore
                  entity => {
                    // @fixme overhead?
                    // @ts-ignore
                    if (eventList.indexOf(entity) === -1)
                      // @ts-ignore
                      eventList.push(entity)
                  }
                )
              }
            }
          })
        }
      }
    }
  }

  stop() {
    this.enabled = false
  }

  play() {
    this.enabled = true
  }

  // @question rename to clear queues?
  clearEvents() {
    for (let queryName in this.queries) {
      let query = this.queries[queryName]
      if (query.added) query.added.length = 0
      if (query.removed) query.removed.length = 0
      if (query.changed) {
        if (Array.isArray(query.changed)) {
          query.changed.length = 0
        } else {
          for (let name in query.changed) {
            query.changed[name].length = 0
          }
        }
      }
    }
  }

  canExecute() {
    if(this.mandatoryQueries.length === 0) return true

    for(let i=0; i < this.mandatoryQueries.length; i++) {
      let query = this.mandatoryQueries[i]
      if (query.entities.length === 0) {
        return false
      }
    }

    return true
  }
  async execute(delta: number, time: number){}
}

export function Not(klass: Klass<Component>) {
  return {
    operator: "not",
    Component: klass
  }
}
// System:1 ends here
