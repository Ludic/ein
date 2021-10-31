import { Klass } from './Klass'
import { WritablePart } from './Utils'

interface ComponentStaticProps {
  id: number
  mask: number
  property: any
  data: {[key: string]: any}
}

type HiddenProperties = '_reset'|'_types'

export type ComponentInstance<C extends Component> = Omit<C, HiddenProperties>
export type ComponentData<C extends Component> = Omit<WritablePart<C>, HiddenProperties|keyof C['_types']>&C['_types']

export type GetComponent<C> = C extends ComponentConstructor<infer T> ? T : C

export class Component {
  static id: ComponentStaticProps['id'] = 0
  static mask: ComponentStaticProps['mask'] = 0
  static property: ComponentStaticProps['property'] = ''
  static data: ComponentStaticProps['data'] = {}

  private $keys: string[]

  // hidden properties
  _types: {[key: string]: any}
  _reset(data: any = {}): this {
    Object.assign(this, data)
    return this
  }
}

// export const Component: ComponentConstructor&typeof ComponentInstance['data'] = ComponentInstance

export type ComponentConstructor<T extends Component = Component> = Klass<T>&ComponentStaticProps;
