export class Component {
  _data: any
  class: string
  modified: boolean

  constructor(data?: any){
    console.log("this", this)
    this.class = this.constructor.name
    this.data = data
    this.modified = false
  }

  get data(){
    return this._data
  }

  set data(data){
    this._data = data
    this.modified = true
  }
}
