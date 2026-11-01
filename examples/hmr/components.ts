import { Component } from '@ludic/ein'

export class Position extends Component {
  x = 200
  y = 200
}

export class Spin extends Component {
  angle = 0
  /** radians per second: change it and save to see hot reload keep the state */
  speed = 1
}
