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

export type ComponentInstance<C extends Component> = Required<Omit<C, HiddenProperties>>
export type ComponentData<C extends Component> = Omit<WritablePart<C>, HiddenProperties>

export type GetComponent<C> = C extends ComponentConstructor<infer T> ? T : C

export class Component {
  static id: ComponentStaticProps['id'] = 0
  static mask: ComponentStaticProps['mask'] = 0
  static property: ComponentStaticProps['property'] = ''
  static data: ComponentStaticProps['data'] = {}

  // hidden properties
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

export type ComponentConstructor<T extends Component = Component> = Klass<T>&ComponentStaticProps;
