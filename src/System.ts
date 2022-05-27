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

  private timers!: Array<SystemTimer>

  constructor(priority: number = 0, enabled: boolean = true) {
    this.priority = priority
    this.enabled = enabled
    this.timers = []
  }

  update(delta: number, time: number): void { }

  updateTimers(delta: number, time: number){
    this.timers.slice().forEach((timer, ix)=>{
      if(time >= timer.end){
        this.timers.splice(ix, 1)
        timer.handler()
      }
    })
  }

  shouldExecute(): boolean {
    return this.enabled
  }

  // Listeners
  onAdded(engine: Engine): void {
    this.engine = engine
  }
  onRemoved(): void { }

  setTimeout(handler: ()=>void, duration: number){
    const timer = {
      handler,
      end: this.engine.time + duration
    }
    this.timers.push(timer)
  }

}

interface SystemTimer {
  end: number
  handler: ()=>void
}