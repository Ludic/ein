import { Klass } from './Klass'
import { Component, ComponentConstructor } from './Component'
import { Entity } from './Entity'
import { bitSet, bitMask } from './Utils'
import { ComponentInstance } from 'src'
import { ReactiveEffectRunner } from '@vue/reactivity'

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

export type QueryEvent = 'added'|'removed'

export class Query<All extends Component=Component> {
  entities: Set<Entity<All>> = new Set()
  added: Set<Entity<All>> = new Set()
  removed: Set<Entity<All>> = new Set()


  protected readonly _options: QueryOptions
  // update: ReactiveEffectRunner

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

  add(entity: Entity<any>){
    if(!this.entities.has(entity)){
      this.added.add(entity)
    }
    this.entities.add(entity)
  }

  remove(entity: Entity<any>){
    if(this.entities.delete(entity)){
      this.removed.add(entity)
    }
  }

  clear(){
    this.entities.clear()
    this.added.clear()
    this.removed.clear()
    // console.log('query.clear')
    // this.entities = []
  }
  reset(){
    this.added.clear()
    this.removed.clear()
  }

  on(event: QueryEvent, fn: ()=>void){
    console.log('query.on', event)
  }

}
