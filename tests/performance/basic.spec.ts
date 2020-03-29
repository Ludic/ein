import { assert } from 'chai'
import { Component, TransferableComponent, Entity, EntityManager, System, Engine } from '../../src/'


describe('Basic Performance', ()=>{

  it('1000x createEntity()', async()=>{
    const engine: Engine = new Engine()
    for(let i=0; i<1000; i++){
      let player: Entity = engine.createEntity("player")
    }
    assert.equal(engine.entity_manager.entities.length,  1000)
  })

  it('10000x createEntity()', async()=>{
    const engine: Engine = new Engine()
    for(let i=0; i<10000; i++){
      let player: Entity = engine.createEntity("player")
    }
    assert.equal(engine.entity_manager.entities.length,  10000)
  })

  it('1000x addComponent()', async()=>{
    const engine: Engine = new Engine()
    const player: Entity = engine.createEntity("player")
    for(let i=0; i<10000; i++){
      player.addComponent(Component, {x: 5, y: 1})
    }
  })


})
