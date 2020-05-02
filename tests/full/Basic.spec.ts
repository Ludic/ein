import { assert } from 'chai'
import { Component, Entity, System, Query, Engine } from '../../src/'


const engine: Engine = new Engine()
let test_executions: number = 0

describe('Full - Basic', ()=>{

  it('init', async()=>{
    assert.equal(engine.component_manager.components.length, 0)
    assert.equal(engine.entity_manager.entities.length, 0)
    assert.equal(engine.system_manager.systems.length, 0)
  })

  it('add systems', async()=>{
    engine.addSystem(TestSystem)
    assert.equal(engine.system_manager.systems.length, 1)
  })

  it('add entities', async()=>{
    let entity: Entity = engine.createEntity("Player")
    assert.equal(engine.entity_manager.entities.length, 1)
  })



})



export class PositionComponent extends Component {
  data: {
    x: number
    y: number
  }
  constructor(){
    super()
  }
}

class TestSystem extends System {
  queries: Query[]

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
    const queries = {
      players: {
        entity_name: "Player",
      },
    }
  }

  execute(delta: number, time: number): void {
    test_executions++
  }
}
