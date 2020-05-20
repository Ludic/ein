let next: number = 0

export type ComponentData<C extends Component> = Omit<C, '_id'|'_name'>

export class Component {
  _id: number
  _name: string

  constructor(data: any = {}){
    this._id = next++
    this._name = this.constructor.name
    Object.entries(data).forEach(([key, value])=>{
      // @ts-ignore
      this[key] = value
    })
  }
}
