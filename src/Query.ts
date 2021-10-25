import { Klass } from './Klass'
import { Component, ComponentConstructor } from './Component'
import { Entity } from './Entity'
import { effect } from './reactivity'
import { ReactiveEffect, ReactiveEffectRunner } from '@vue/reactivity'
import { bitSet, bitMask } from './Utils'
import { ComponentInstance } from 'src'

// TODO, add things like all_component_classes, changed_components, etc
// export interface Query {
//   entity_name?: string
//   component_classes?: Klass<Component>[]
// }

type QueryComponents = Array<ComponentConstructor>
type QueryFlushOptions = 'immediate'|'post'
type QueryComponentOptions = {
  any?: QueryComponents
  all?: QueryComponents
  none?: QueryComponents
  flush?: QueryFlushOptions
}

export type QueryOptions = QueryComponentOptions

// type ComponentFromConstructor<C> = C extends ComponentConstructor<infer R> ? R : never

// type EntityHasComponent<T> = Entity&{
//   getComponent<C extends Component=ComponentFromConstructor<T>>(cls: ComponentConstructor<C>): ComponentInstance<C>
//   // getComponent(cls: string): ComponentInstance<C>
// }

// class Test extends Component {
//   test: number
// }

// let r: ComponentFromConstructor<Test>

// let a: EntityHasComponent<Test> = {} as EntityHasComponent<Test>
// let b = a.getComponent(Test)
// let c = a.getComponent()

export type QueryEvent = 'added'|'removed'

export class Query {
  entities: Set<Entity> = new Set()
  // entities: Entity[] = []


  protected readonly _options: QueryOptions
  update: ReactiveEffectRunner

  private readonly _any: number
  private readonly _all: number
  private readonly _none: number

  // static isNameQuery(query: Query): query is Query<QueryOptionsByName> {
  //   return 'name' in query._options
  // }
  // static isComponentsQuery(query: Query): query is Query<QueryOptionsByComponents> {
  //   return 'components' in query._options
  // }
  
  constructor(options: QueryOptions){
    this._options = options

    this._any = (options.any ?? []).reduce((a, c) => bitSet(a, c.mask), 0)
    this._all = (options.all ?? []).reduce((a, c) => bitSet(a, c.mask), 0)
    this._none = (options.none ?? []).reduce((a, c) => bitSet(a, c.mask), 0)
  }

  get flush(){
    return this._options.flush || 'post'
  }

  matches(entity: Entity){
    const mask = entity.mask

    const any = this._any === 0 || bitMask(mask, this._any) > 0;
    const all = bitMask(mask, this._all) === this._all;
    const none = bitMask(mask, this._none) === 0;

    return any && all && none;
  }

  add(entity: Entity){
    this.entities.add(entity)
    // console.log('query.add', entity)
    // this.entities.push(entity)
  }

  remove(entity: Entity){
    this.entities.delete(entity)
  }

  clear(){
    this.entities.clear()
    // this.entities = []
  }

  on(event: QueryEvent, fn: ()=>void){
    console.log('query.on', event)
  }

}
