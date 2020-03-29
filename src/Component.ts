let next: number = 0
export class Component {
  _data: any
  id: number
  class_name: string
  modified: boolean

  constructor(data?: any){
    this.class_name = this.constructor.name
    this.data = data
    this.modified = false
    this.id = next++
  }

  get data(){
    return this._data
  }

  set data(data){
    this._data = data
    this.modified = true
  }
}
