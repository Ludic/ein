import { assert } from 'chai'

import Engine from '@lib/Engine'
import System from '@lib/System'
import Entity from '@lib/Entity'
import EntityListener from '@lib/EntityListener'

import PositionComponent from '@tests/components/position'
import MovementComponent from '@tests/components/movement'

import PositionSystem from '@tests/systems/position'
import MovementSystem from '@tests/systems/movement'

describe('Basic', () => {
  it('should basically work', async () => {

    const engine = new Engine()

    const movementSystem: MovementSystem = new MovementSystem()
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

    // console.log(engine.familyManager.families)
    // console.log("MovementSystem has: " + movementSystem.entities.length + " entities.");
    // console.log("PositionSystem has: " + positionSystem.entities.length + " entities.");

    for(let i=0; i<10; i++){
	    engine.update(0.25)
	    if (i > 5) engine.removeSystem(movementSystem);
    }

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
