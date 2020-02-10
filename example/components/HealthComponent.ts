import { Component } from '../../src'
export class HealthComponent extends Component {
  value: number

  constructor(){
    super()
    this.reset()
  }

  reset(){
    this.value = 0
  }
}
