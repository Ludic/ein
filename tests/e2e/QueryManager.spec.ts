import { assert } from 'chai'
import { Component, TransferableComponent, Query, Entity, System, Engine } from '../../src/'






describe('QueryManager', ()=>{

  it('entitiesForQuery()', async()=>{
    const engine: Engine = new Engine()
    engine.createEntity("player")

    const query: Query = {
      entity_name: "player"
    }

    let entities: Entity[] = engine.entitiesForQuery(query)
    assert.equal(entities.length, 1)

    engine.createEntity("player")

    console.log(entities)
  })


  // it('execute()', async()=>{
  //   assert.equal(engine.system_manager.systems.length, 1)
  //   engine.execute(0, 1)
  //   assert.equal(test_executions, 1)
  // })

})
