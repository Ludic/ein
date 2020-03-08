import { Component, TransferableComponent, Entity, System, Engine } from '../src/'

const engine: Engine = new Engine()

class TestSystem extends System {
  total_executions: number
  entities: Entity[]

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
    this.total_executions = 0
  }

  onAdded(engine: Engine): void {
    this.engine = engine
    this.entities = []
  }

  execute(delta: number, time: number): void {
    console.log("entities: ", this.entities)
    this.total_executions++
  }
}


const test_system: System = new TestSystem()

engine.addSystem(test_system)
engine.execute(0, 1)
engine.execute(1, 2)

console.log(test_system)
