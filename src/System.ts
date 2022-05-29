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

  private timers: Set<SystemTimer> = new Set()

  constructor(priority: number = 0, enabled: boolean = true) {
    this.priority = priority
    this.enabled = enabled
  }

  update(delta: number, time: number): void { }

  updateTimers(delta: number, time: number){
    this.timers.forEach((timer)=>{
      if(time >= timer.end){
        this.timers.delete(timer)
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

  setTimeout(handler: ()=>void, duration: number): SystemTimerCancel {
    const timer: SystemTimer = {
      handler,
      end: this.engine.time + duration
    }
    this.timers.add(timer)
    return ()=>{
      return this.timers.delete(timer)
    }
  }

}

interface SystemTimer {
  end: number
  handler: ()=>void
}
export type SystemTimerCancel = ()=>boolean
