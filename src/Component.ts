import { Klass } from './Klass'

let next: number = 0

export type ComponentData<C extends Component> = Omit<C, '_id'|'_name'|'_isSingleton'>

export class Component {
  static readonly _isSingleton: boolean = false
  readonly _isSingleton: boolean = false
  _id: number
  _name: string

  constructor(data: any = {}){
    this._id = next++
    this._name = this.constructor.name
    Object.entries(data).forEach(([key, value])=>{
      // do not want ability to set these
      if(key !== '_id' && key !== '_name'){
        // @ts-ignore
        this[key] = value
      }
    })
  }
}


export class SingletonComponent extends Component {
  static readonly _isSingleton: true = true
  readonly _isSingleton: true = true
}

export function isSingletonComponent(klass: Klass<Component|SingletonComponent>): klass is Klass<SingletonComponent> {
  return (klass as typeof SingletonComponent)._isSingleton
}