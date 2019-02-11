import { assert } from 'chai'

import { Engine } from '@lib/engine'
import { System } from '@lib/system'
import { Entity, EntityListener } from '@lib/entity'

import PositionComponent from '@tests/components/position'
import MovementComponent from '@tests/components/movement'

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
	    if (i > 5) entity.add(new MovementComponent(10, 2))

	    engine.addEntity(entity)
    }

    console.log("MovementSystem has: " + movementSystem.entities.length + " entities.");
    console.log("PositionSystem has: " + positionSystem.entities.length + " entities.");

    for(let i=0; i<10; i++){
	    engine.update(0.25)
	    if (i > 5) engine.removeSystem(movementSystem);
    }

    engine.removeEntityListener(listener)

  })
})


class PositionSystem extends System {
	public entities: Entity[]


	public addedToEngine(engine: Engine): void {
		this.entities = engine.getEntitiesFor(Family.all(PositionComponent.class).get())
		console.log("PositionSystem added to engine.")
	}

	public removedFromEngine(engine: Engine): void {
		console.log("PositionSystem removed from engine.")
    this.entities = []
	}
}

class MovementSystem extends System {
	public entities: Entity[]

	private pm: ComponentMapper<PositionComponent> = ComponentMapper.getFor(PositionComponent.class)
	private mm: ComponentMapper<MovementComponent> = ComponentMapper.getFor(MovementComponent.class)

	public addedToEngine(engine: Engine): void {
		this.entities = engine.getEntitiesFor(Family.all(PositionComponent.class, MovementComponent.class).get())
		console.log("MovementSystem added to engine.")
	}

	public removedFromEngine(engine: Engine): void {
		console.log("MovementSystem removed from engine.")
		this.entities = []
	}

	public update(deltaTime: number): void {
    this.entities.forEach((e: Entity) => {

			const p: PositionComponent = this.pm.get(e)
			const m: MovementComponent = this.mm.get(e)

			p.x += m.velocityX * deltaTime;
			p.y += m.velocityY * deltaTime;
    })

		console.log(this.entities.length + " Entities updated in MovementSystem.")
  }
}

class Listener implements EntityListener {
	public entityAdded(entity: Entity): void {
    console.log("Entity added " + entity)
	}
	public entityRemoved(entity: Entity): void {
    console.log("Entity removed " + entity)
	}
}
