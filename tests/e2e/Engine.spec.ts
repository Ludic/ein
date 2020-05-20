import { assert } from 'chai'
import { Component, Entity, System, Engine } from '../../src/'

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

  it('createEntity()', async()=>{
    const entity: Entity = engine.createEntity("player")
    assert.equal(entity.name, "player")
    assert.equal(engine.entity_manager.entities.size, 1)
  })

  it('addSystem()', async()=>{
    const system: System = engine.addSystem(TestSystem)
    assert.equal(system.enabled, true)
    assert.equal(engine.system_manager.systems.length, 1)
  })

  it('execute()', async()=>{
    assert.equal(engine.system_manager.systems.length, 1)
    engine.execute(0, 1)
    assert.equal(test_executions, 1)
  })

})
