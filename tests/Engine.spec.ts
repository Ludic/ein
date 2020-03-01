import { assert } from 'chai'
import { Component, TransferableComponent, Entity, System, Engine } from '../src/'

const engine: Engine = new Engine()
let test_executions: number = 0

class TestSystem extends System {
  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
  }

  execute(delta: number, time: number): void {
    test_executions++
  }
}


describe('Engine', ()=>{

  it('should probably initialize', async()=>{
    assert.equal(!!engine, true)
  })

  it('addSystem()', async()=>{
    const system: System = new TestSystem()

    engine.addSystem(system)
    assert.equal(engine.system_manager.systems.length, 1)
  })


  it('execute()', async()=>{
    const system: System = new TestSystem()
    assert.equal(engine.system_manager.systems.length, 1)

    engine.execute(test_executions, 1)

  })

})
