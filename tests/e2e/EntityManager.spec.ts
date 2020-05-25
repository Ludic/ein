import { assert } from 'chai'
import { Engine } from '../../src/Engine'
import { Entity } from '../../src/Entity'


describe('EntityManager', ()=>{

  it('createEntity()', async()=>{
    const engine: Engine = new Engine()
    const player: Entity = engine.createEntity("player")
    assert.equal(player.name, "player")
    assert.equal(player.active, true)
  })



})
