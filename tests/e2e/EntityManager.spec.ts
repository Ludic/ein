import { assert } from 'chai'
import { Component, Entity, EntityManager, System, Engine } from '../../src/'


describe('EntityManager', ()=>{

  it('createEntity()', async()=>{
    const engine: Engine = new Engine()
    const player: Entity = engine.createEntity("player")
    assert.equal(player.name, "player")
    assert.equal(player.active, true)
  })



})
