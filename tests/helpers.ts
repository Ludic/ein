import { Component, Engine } from '@ludic/ein'

export class Position extends Component {
  x = 0
  y = 0
}
export class Velocity extends Component {
  dx = 1
  dy = 1
}
export class Health extends Component {
  value = 100
}

export function setup(): Engine {
  const engine = new Engine()
  engine.registerComponent(Position).registerComponent(Velocity).registerComponent(Health)
  return engine
}
