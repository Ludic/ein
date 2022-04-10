import { Klass } from './Klass'
import { WritablePart } from './Utils'

interface ComponentStaticProps {
  id: number
  mask: number
  property: any
  data: {[key: string]: any}
}

type HiddenProperties = '_reset'|'_types'|'serialize'
const HIDDEN_PROPERTIES = ['_reset','_types','serialize']

export type ComponentInstance<C extends Component> = Omit<C, HiddenProperties>
// export type ComponentData<C extends Component> = Omit<WritablePart<C>, HiddenProperties|keyof C['_types']>&C['_types']
export type ComponentData<C extends Component> = C['_types'] extends null ? Omit<WritablePart<C>, HiddenProperties> : Omit<WritablePart<C>, HiddenProperties|keyof C['_types']>&C['_types']

export type GetComponent<C> = C extends ComponentConstructor<infer T> ? T : C

export class Component {
  static id: ComponentStaticProps['id'] = 0
  static mask: ComponentStaticProps['mask'] = 0
  static property: ComponentStaticProps['property'] = ''
  static data: ComponentStaticProps['data'] = {}

  // hidden properties
  declare _types: null|{[key: string]: any}
  _reset(data: any = {}): this {
    // NOTE: can this be optimized??
    Object.entries(data).forEach(([key, val])=>{
      if(!HIDDEN_PROPERTIES.includes(key) && this.hasOwnProperty(key)){
        // @ts-ignore
        this[key] = val
      }
    })
    return this
  }

  serialize(){
    return Object.fromEntries(Object.entries(this).filter(([key, val])=>{
      return !HIDDEN_PROPERTIES.includes(key)
    }))
  }
}

// export const Component: ComponentConstructor&typeof ComponentInstance['data'] = ComponentInstance

export type ComponentConstructor<T extends Component = Component> = Klass<T>&ComponentStaticProps;
