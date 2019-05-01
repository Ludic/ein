import { assert } from 'chai'
import Bits from '../src/Bits'
import Listener from '../src/Listener'
import Signal from '../src/Signal'
import Component from '../src/Component'
import ComponentType from '../src/ComponentType'
import ComponentManager from '../src/ComponentManager'
import ComponentMapper from '../src/ComponentMapper'
import Entity from '../src/Entity'
import EntityListener from '../src/EntityListener'

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

describe('Entity', () => {

  it('should addAndReturnComponent()', async () => {
    const entity: Entity = new Entity()
    const componentA: ComponentA = new ComponentA()
    const componentB: ComponentB = new ComponentB()

    assert.equal(componentA, entity.addAndReturn(componentA))
    assert.equal(componentB, entity.addAndReturn(componentB))

    assert.equal(2, entity.getComponents().length)
  })

  it('should check for no Components', async () => {
    const entity: Entity = new Entity()

    assert.isTrue(entity.getComponentBits().isEmpty())
    assert.equal(0, entity.getComponents().length)
    assert.isNull(am.get(entity))
    assert.isNull(bm.get(entity))
    assert.isFalse(am.has(entity))
    assert.isFalse(bm.has(entity))
  })

  it('should add() and remove() Components', async () => {
    const entity: Entity = new Entity()
    entity.add(new ComponentA())

    assert.equal(1, entity.getComponents().length)

    let componentBits: Bits = entity.getComponentBits()
    const componentAIndex: number = ComponentType.getIndexFor(ComponentA)
    for(let i=0; i < componentBits.length(); ++i) {
      assert.equal(i == componentAIndex, componentBits.get(i))
    }

    assert.isNotNull(am.get(entity))
    assert.isNull(bm.get(entity))
    assert.isTrue(am.has(entity))
    assert.isFalse(bm.has(entity))

    entity.remove(ComponentA)
    assert.equal(0, entity.getComponents().length)

    for(let i=0; i < componentBits.length(); ++i) {
    	assert.isFalse(componentBits.get(i))
    }

    assert.isNull(am.get(entity))
    assert.isNull(bm.get(entity))
    assert.isFalse(am.has(entity))
    assert.isFalse(bm.has(entity))
  })

  it('should add() and remove() all Components', async () => {
    const entity: Entity = new Entity()
    entity.add(new ComponentA())
    entity.add(new ComponentB())

    assert.equal(2, entity.getComponents().length)

    const componentAIndex: number = ComponentType.getIndexFor(ComponentA)
    const componentBIndex: number = ComponentType.getIndexFor(ComponentB)

    let componentBits: Bits = entity.getComponentBits()
    for (let i=0; i < componentBits.length(); ++i) {
    	assert.equal(i == componentAIndex || i == componentBIndex, componentBits.get(i))
    }

    assert.isNotNull(am.get(entity))
    assert.isNotNull(bm.get(entity))
    assert.isTrue(am.has(entity))
    assert.isTrue(bm.has(entity))

    entity.removeAll();

    assert.equal(0, entity.getComponents().length)

    for(let i=0; i < componentBits.length(); ++i) {
    	assert.isFalse(componentBits.get(i))
    }

    assert.isNull(am.get(entity))
    assert.isNull(bm.get(entity))
    assert.isFalse(am.has(entity))
    assert.isFalse(bm.has(entity))

  })

  it('should add the same Component', async () => {
    const entity: Entity = new Entity()

    const a1: ComponentA = new ComponentA()
    const a2: ComponentA = new ComponentA()

    entity.add(a1)
    entity.add(a2)

    assert.equal(1, entity.getComponents().length)
    assert.isTrue(am.has(entity))
    assert.notEqual(a1, am.get(entity))
    assert.equal(a2, am.get(entity))
  })

  it('should have working componentListeners', async () => {
    const addedListener: EntityListenerMock = new EntityListenerMock()
    const removedListener: EntityListenerMock = new EntityListenerMock()

    const entity: Entity = new Entity()
    entity.componentAdded.add(addedListener)
    entity.componentRemoved.add(removedListener)

    assert.equal(0, addedListener.counter)
    assert.equal(0, removedListener.counter)

    entity.add(new ComponentA())
    assert.equal(1, addedListener.counter)
    assert.equal(0, removedListener.counter)

    entity.remove(ComponentA)
    assert.equal(1, addedListener.counter)
    assert.equal(1, removedListener.counter)

    entity.add(new ComponentB())
    assert.equal(2, addedListener.counter)

    entity.remove(ComponentB)
    assert.equal(2, removedListener.counter)
  })

  it('should getComponentByClass', async () => {
    const compA: ComponentA = new ComponentA()
    const compB: ComponentB = new ComponentB()

    const entity: Entity = new Entity()
    entity.add(compA).add(compB)

    const retA = entity.getComponent(ComponentA)
    const retB = entity.getComponent(ComponentB)

    assert.isNotNull(retA)
    assert.isNotNull(retB)

    assert.isTrue(retA == compA)
    assert.isTrue(retB == compB)
  })

})
