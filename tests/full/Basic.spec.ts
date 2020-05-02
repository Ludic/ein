import { assert } from 'chai'
import { Component, Entity, System, Query, Engine } from '../../src/'


describe('Full - Basic', ()=>{

  it('init', async()=>{
    assert.equal(engine.component_manager.components.length, 0)
    assert.equal(engine.entity_manager.entities.length, 0)
    assert.equal(engine.system_manager.systems.length, 0)
  })

  it('add systems', async()=>{
    engine.addSystem(MovementSystem)
    assert.equal(engine.system_manager.systems.length, 1)
  })

  it('add entities', async()=>{
    createPlayer(engine)
    assert.equal(engine.entity_manager.entities.length, 1)
    assert.equal(engine.component_manager.components.length, 1)
  })

  it('execute', async()=>{
    await engine.execute(0, 1)
    await engine.execute(1, 2)

    assert.equal(engine.system_manager.systems[0].executions, 2)
    assert.equal(engine.executions, 2)
  })

})

const engine: Engine = new Engine()

function createPlayer(engine: Engine): Entity {
  let entity: Entity = engine.createEntity("Player")
  engine.addComponentToEntity(entity, PositionComponent, {x: 5, y :10})
  return entity
}

export class PositionComponent extends Component {
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
    this.players.forEach((player: Entity)=>{
      let pos: PositionComponent = this.engine.component_manager.hash_to_component[player.id + "PositionComponent"]
      pos.data.x++
      pos.data.y++
    })
  }
}
