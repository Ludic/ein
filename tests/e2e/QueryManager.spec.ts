import { assert } from 'chai'
import { Component, TransferableComponent, Query, Entity, System, Engine } from '../../src/'


describe('QueryManager', ()=>{

  it('entitiesForQuery()', async()=>{
    const engine: Engine = new Engine()
    const query: Query = {
      entity_name: "player"
    }

    let entities: Entity[] = engine.entitiesForQuery(query)
    engine.createEntity("player")
    assert.equal(entities.length, 1)

    engine.createEntity("player")
    assert.equal(entities.length, 2)

    engine.createEntity("not a player")
    assert.equal(entities.length, 2)
  })
})
