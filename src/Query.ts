import { Klass } from './Klass'
import { Component } from './Component'
import { Entity } from './Entity'
import { effect } from './reactivity'
import { ReactiveEffect } from '@vue/reactivity'

// TODO, add things like all_component_classes, changed_components, etc
// export interface Query {
//   entity_name?: string
//   component_classes?: Klass<Component>[]
// }

export interface QueryOptionsByName {
  name: string
}
type QueryComponents = Array<Klass<Component>>
type QueryComponentOptions = {
  include?: QueryComponents
  exclude?: QueryComponents
  only?: boolean
}
export interface QueryOptionsByComponents {
  components: QueryComponents|QueryComponentOptions
}

export type QueryOptions = QueryOptionsByName|QueryOptionsByComponents

export class Query<Opts extends QueryOptions = QueryOptions> {
  entities: Entity[] = []

  readonly _options: Opts
  update: ReactiveEffect

  static isNameQuery(query: Query): query is Query<QueryOptionsByName> {
    return 'name' in query._options
  }
  static isComponentsQuery(query: Query): query is Query<QueryOptionsByComponents> {
    return 'components' in query._options
  }
  
  constructor(options: Opts){
    this._options = options
  }
}
