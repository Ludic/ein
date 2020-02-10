import { Component } from '../../src'
export class PositionComponent extends Component {
  x: number
  y: number

  constructor(){
    super()
    this.reset()
  }

  reset(){
    this.x = 0
    this.y = 0
  }
}
