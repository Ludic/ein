import { Component } from './Component'

const encoder = new TextEncoder()
const decoder = new TextDecoder()

export class TransferableComponent extends Component {
  _data: any
  _transferable_data: any
  modified: boolean
  lastModified: string | null

  constructor(data?: any){
    super(data)
    data ? this.lastModified = "data" : this.lastModified = null
  }

  get data(){
    if(this.lastModified == "transferable"){
      this._data = this.fromTransferable(this._transferable_data)
      this.lastModified = null
    }
    return this._data
  }

  set data(data: any){
    this._data = data
    this.modified = true
    this.lastModified = "data"
  }

  get transferable_data(){
    if(this.lastModified == "data"){
      this._transferable_data = this.toTransferable(this.data)
      this.lastModified = null
    }
    return this._transferable_data
  }

  set transferable_data(data: ArrayBuffer){
    this._transferable_data = data
    this.modified = true
    this.lastModified = "transferable"
  }

  toTransferable(data: any){
    return encoder.encode(JSON.stringify(data))
    // TODO smarted encoding?
    // let transferable_data: any = {}
    // for(let [key, value] in data){
    //   if(typeof(value) == 'string'){
    //     transferable_data[key] = encoder.encode(value)
    //   }
    //   if(typeof(value) == 'number'){
    //     transferable_data[key] = encoder.encode(value.toString())
    //   }
    // }
    // return transferable_data
  }

  fromTransferable(data: any){
    return JSON.parse(decoder.decode(data))
    // TODO smarted decoding? (see above)
  }
}
