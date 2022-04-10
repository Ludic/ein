import { Component } from './Component'
import { Entity } from './Entity'
import { Engine } from './Engine'

export class System {
  /**
   * @internal  used for hmr
   */
  static __id: string

  priority: number
  order: number = 0
  enabled: boolean

  engine!: Engine

  constructor(priority: number = 0, enabled: boolean = true) {
    this.priority = priority
    this.enabled = enabled
  }

  update(delta: number, time: number): void {}

  shouldExecute(): boolean {
    return this.enabled
  }

  // Listeners
  onAdded(engine: Engine): void {
    this.engine = engine
  }
  onRemoved(): void { }

}
