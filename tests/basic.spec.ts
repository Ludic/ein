import { assert } from 'chai'

import Engine from '../src/Engine'
import Entity from '../src/Entity'
import EntityListener from '../src/EntityListener'

import PositionComponent from './components/position'
import MovementComponent from './components/movement'

import PositionSystem from './systems/position'
import MovementSystem from './systems/movement'

describe('Basic', () => {
  it('should basically work', async () => {

    const engine = new Engine()

    const movementSystem = new MovementSystem()
    const positionSystem: PositionSystem = new PositionSystem()

    engine.addSystem(movementSystem)
    engine.addSystem(positionSystem)

    const listener: Listener = new Listener()
    engine.addEntityListener(listener)

    for(let i=0; i<10; i++){
	    const entity: Entity = engine.createEntity()
	    entity.add(new PositionComponent(10, 0))
	    if(i > 5) {
        entity.add(new MovementComponent(10, 2))
      }
	    engine.addEntity(entity)
    }

    for(let i=0; i<1; i++){
	    engine.update(0.25)
	    // if (i > 5) engine.removeSystem(movementSystem)
    }

    assert.equal(positionSystem.entities.length, 10)
    assert.equal(movementSystem.entities.length, 4)


    engine.removeEntityListener(listener)

  })
})

class Listener implements EntityListener {
	public entityAdded(entity: Entity): void {
    console.log("EntityListener.entityAdded()" + entity)
	}
	public entityRemoved(entity: Entity): void {
    console.log("EntityListener.entityRemoved()" + entity)
	}
}
