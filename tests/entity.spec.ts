import { assert } from 'chai'
import { Component } from '@lib/component'
import { Entity, EntityListener } from '@lib/entity'

// import { Engine } from '@lib/engine'
// import { System } from '@lib/system'

import PositionComponent from '@tests/components/position'
import MovementComponent from '@tests/components/movement'


describe('Entity', () => {
  it('should add() and getComponentByClass()', async () => {
    const e: Entity = new Entity()
    const pc: PositionComponent = new PositionComponent(5, 10)
    const mc: MovementComponent = new MovementComponent(5, 10)

    e.add(pc)
    e.add(mc)

    let _pc = e.getComponentByClass(PositionComponent)
    let _mc = e.getComponentByClass(MovementComponent)

    assert.equal(pc, _pc)
    assert.equal(mc, _mc)
  })

  it('should remove()', async () => {
    const e: Entity = new Entity()
    const pc: PositionComponent = new PositionComponent(5, 10)
    const mc: MovementComponent = new MovementComponent(5, 10)

    e.add(pc)
    e.add(mc)

    let _pc = e.getComponentByClass(PositionComponent)
    let _mc = e.getComponentByClass(MovementComponent)

    assert.equal(pc, _pc)
    assert.equal(mc, _mc)

    e.remove(PositionComponent)
    e.remove(MovementComponent)

    _pc = e.getComponentByClass(PositionComponent)
    _mc = e.getComponentByClass(MovementComponent)

    assert.equal(_pc, undefined)
    assert.equal(_mc, undefined)
  })

})
