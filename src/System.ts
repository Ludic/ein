import { Klass } from './Klass'
import { Component } from './Component'
import { Entity } from './Entity'
import { Engine } from './Engine'

export class System {
  priority: number
  order: number
  enabled: boolean

  engine: Engine

  constructor(priority: number = 0, enabled: boolean = true) {
    this.priority = priority
    this.enabled = enabled
  }

  execute(delta: number, time: number): void {}
}
