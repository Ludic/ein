import Entity from '@lib/Entity'
import EntityListener from '@lib/EntityListener'
import System from '@lib/System'
import Engine from '@lib/Engine'

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
