import { System } from '@lib/system'
import { Engine } from '@lib/engine'
import { Entity, EntityListener } from '@lib/entity'

import PositionComponent from '@tests/components/position'

export default class PositionSystem extends System {
	public entities: Entity[]

	public addedToEngine(engine: Engine): void {
    // TODO
    this.entities = []

		// this.entities = engine.getEntitiesFor(Family.all(PositionComponent.class).get())
		console.log("PositionSystem added to engine.")
	}

	public removedFromEngine(engine: Engine): void {
		console.log("PositionSystem removed from engine.")
    this.entities = []
	}
}
