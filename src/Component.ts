export class Component {
  _data: any
  modified: boolean

  constructor(data?: any){
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
