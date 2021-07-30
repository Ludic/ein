import { Klass } from './Klass'
import { WritableKeysOf, WritablePart, ExcludeFunctionProps } from './Utils'

interface ComponentStaticProps {
  id: number
  mask: number
  property: any
  data: {[key: string]: any}
}

// export type ComponentData<C extends Component = Component> = ComponentConstructor<C>['data']

type HiddenProperties = '_reset'

export type ComponentInstance<C extends Component> = Omit<C, HiddenProperties>
export type ComponentData<C extends Component> = Omit<WritablePart<C>, HiddenProperties>

export class Component {
  static id: ComponentStaticProps['id'] = 0
  static mask: ComponentStaticProps['mask'] = 0
  static property: ComponentStaticProps['property'] = ''
  static data: ComponentStaticProps['data'] = {}

  private _data: ComponentStaticProps['data'] = {}

  // a: ComponentConstructor<this>['data']

  private $keys: string[]

  _reset(data: any = {}): this {
    Object.assign(this, data)
    return this
  }
}

// export const Component: ComponentConstructor&typeof ComponentInstance['data'] = ComponentInstance

export type ComponentConstructor<T extends Component = Component> = Klass<T>&ComponentStaticProps;
