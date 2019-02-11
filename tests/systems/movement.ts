import { Engine } from '@lib/engine'
import { Entity, EntityListener } from '@lib/entity'

import PositionComponent from '@tests/components/position'
import MovementComponent from '@tests/components/movement'

export default class MovementSystem extends System {
	public entities: Entity[]

	// private pm: ComponentMapper<PositionComponent> = ComponentMapper.getFor(PositionComponent.class)
	// private mm: ComponentMapper<MovementComponent> = ComponentMapper.getFor(MovementComponent.class)

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
