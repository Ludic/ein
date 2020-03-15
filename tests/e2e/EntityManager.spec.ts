import { assert } from 'chai'
import { Component, TransferableComponent, Entity, EntityManager, System, Engine } from '../../src/'


describe('EntityManager', ()=>{

  it('createEntity()', async()=>{
    const engine: Engine = new Engine()
    const player: Entity = engine.createEntity("player")
    assert.equal(player.name, "player")
    assert.equal(player.id, 0)
    assert.equal(player.active, true)
    assert.equal(Object.keys(player.class_to_component).length, 0)
  })

  // it('addComponent()', async()=>{
  //   const engine: Engine = new Engine()
  //   const player: Entity = engine.createEntity("player")

  //   const position: Component = new Component()
  //   player.addComponent("position", {x: 5, y: 1})

  //   // assert.equal(!!player.class_to_component["position"], true)
  // })


})
