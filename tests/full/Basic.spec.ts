import { assert } from 'chai'
import { Component, Entity, System, Query, Engine } from '../../src/'

let engine: Engine

describe('Full - Basic', ()=>{

  it('init', async()=>{
    engine = new Engine()
    assert.equal(engine.component_manager.components.length, 0)
    assert.equal(engine.entity_manager.entities.length, 0)
    assert.equal(engine.system_manager.systems.length, 0)
  })

  it('add systems', async()=>{
    engine.addSystem(MovementSystem)
    assert.equal(engine.system_manager.systems.length, 1)
  })

  it('add entities', async()=>{
    engine
      .createEntity("Player")
      .addComponent(PositionComponent, {x: 5, y :10})

    assert.equal(engine.entity_manager.entities.length, 1)
    assert.equal(engine.component_manager.components.length, 1)
  })

  it('execute', async()=>{
    await engine.execute(0, 1)
    await engine.execute(1, 2)

    assert.equal(engine.system_manager.systems[0].executions, 2)
    assert.equal(engine.executions, 2)

    const player: Entity = engine.entity_manager.entities[0]
    const pos: PositionComponent = player.getComponent(PositionComponent)

    assert.equal(pos.data.x, 7)
    assert.equal(pos.data.y, 12)
  })

})


class PositionComponent extends Component {
  data: {
    x: number
    y: number
  }
}

class MovementSystem extends System {
  queries: {[key: string]: Query}
  players: Entity[]

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
    this.queries = {
      players: {
        entity_name: "Player",
      },
    }
  }

  onAdded(engine: Engine): void {
    this.engine = engine
    this.players = this.engine.entitiesForQuery(this.queries.players)
  }

  execute(delta: number, time: number): void {
    this.players.forEach((entity: Entity)=>{
      let pos: PositionComponent = entity.getComponent(PositionComponent)
      pos.data.x++
      pos.data.y++
    })
  }
}
