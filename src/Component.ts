let next: number = 0
export class Component {
  id: number
  modified: boolean
  class_name: string
  data: any

  constructor(data?: any){
    this.id = next++
    this.modified = false
    this.class_name = this.constructor.name
    this.data = data
  }
}
