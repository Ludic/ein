import { assert } from 'chai'
import Listener from '../src/Listener'
import Signal from '../src/Signal'
import Component from '../src/Component'
import ComponentType from '../src/ComponentType'
import ComponentManager from '../src/ComponentManager'
import ComponentMapper from '../src/ComponentMapper'
import Entity from '../src/Entity'
import EntityListener from '../src/EntityListener'
import Family from '../src/Family'
import Engine from '../src/Engine'

import PositionComponent from './components/position'
import MovementComponent from './components/movement'

class ComponentA extends Component {}
class ComponentB extends Component {}


class EntityListenerMock implements Listener<Entity> {
	public counter: number = 0
	public receive(signal: Signal<Entity>, entity: Entity): void {
		this.counter++
		assert.isNotNull(signal)
		assert.isNotNull(entity)
	}
}

const am: ComponentMapper<ComponentA> = ComponentMapper.getFor(ComponentA)
const bm: ComponentMapper<ComponentB> = ComponentMapper.getFor(ComponentB)


describe('EntityListener', () => {

  // TODO entityRemoved not calling
  it('add an EntityListener, and then remove a Family', async () => {
    const engine: Engine = new Engine()

		const e: Entity = new Entity()
		e.add(new PositionComponent(0, 0))
		engine.addEntity(e)

		const family: Family = Family.all(PositionComponent.constructor.prototype).get()

    const listener: EntityListener = {
      entityAdded(entity: Entity): void {},
			entityRemoved(entity: Entity): void {
        // TODO
        console.log("\n\nentityRemoved\n")
				engine.addEntity(new Entity())
			}
		}

		engine.addEntityListener(listener,  0, family)
    engine.removeEntity(e)

    assert.equal(engine.getEntities().length, 0)
  })

  it('add an EntityListener, and then add a Family', async () => {
    const engine: Engine = new Engine()

		const e: Entity = new Entity()
		e.add(new PositionComponent(0, 0))

		const family: Family = Family.all(PositionComponent.constructor.prototype).get()

    const listener: EntityListener = {
      entityAdded(entity: Entity): void {},
			entityRemoved(entity: Entity): void {
        console.log("\n\nentityRemoved\n")
				engine.addEntity(new Entity())
			}
		}

		engine.addEntityListener(listener,  0, family)
    engine.addEntity(e)
  })


})
