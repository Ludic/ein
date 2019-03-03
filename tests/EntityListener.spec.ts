import { assert } from 'chai'
import Listener from '@lib/Listener'
import Signal from '@lib/Signal'
import Component from '@lib/Component'
import ComponentType from '@lib/ComponentType'
import ComponentManager from '@lib/ComponentManager'
import ComponentMapper from '@lib/ComponentMapper'
import Entity from '@lib/Entity'
import EntityListener from '@lib/EntityListener'
import Engine from '@lib/Engine'

class ComponentA implements Component {}
class ComponentB implements Component {}

import PositionComponent from '@tests/components/position'
import MovementComponent from '@tests/components/movement'

class EntityListenerMock implements Listener<Entity> {
	public counter: number = 0
	public receive(signal: Signal<Entity>, entity: Entity): void {
		this.counter++
		assert.isNotNull(signal)
		assert.isNotNull(entity)
	}
}

interface Klass<T> {
  new(): T
}

const am: ComponentMapper<ComponentA> = ComponentMapper.getFor(ComponentA.prototype as Klass<ComponentA>)
const bm: ComponentMapper<ComponentB> = ComponentMapper.getFor(ComponentB.prototype as Klass<ComponentB>)

describe('EntityListener', () => {

  it('add an EntityListener, and then remove a Family()', async () => {
    const engine: Engine = new Engine()

		const e: Entity = new Entity()
		e.add(new PositionComponent(0, 0))
		engine.addEntity(e)

		// const family: Family = Family.all(PositionComponent.class).get()

    const listener: EntityListener = {
      entityAdded(entity: Entity): void {},
			entityRemoved(entity: Entity): void {
				engine.addEntity(new Entity())
			}
		}

		// engine.addEntityListener(listener,  family)
    // engine.removeEntity(e);

  })
})
