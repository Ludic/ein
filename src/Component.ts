// [[file:~/repos/mine/README.org::*Component][Component:1]]
const encoder = new TextEncoder()
const decoder = new TextDecoder()
export class Component {
  _data: any
  _transferable_data: any
  modified: boolean
  isTransferable: boolean

  constructor(data?: any, isTransferable: boolean = false){
    this.data = data
    this.modified = false
    this.isTransferable = isTransferable
  }

  get data(){
    return this._data
  }

  set data(data){
    this._data = data
    this.modified = true
  }

  get transferable_data(){
    const view = encoder.encode('taco')
    console.log(view); // Uint8Array(3)
    return this._transferable
  }

  set transferable_data(data){
    this._data = data
    this.modified = true
  }
}
// Component:1 ends here
