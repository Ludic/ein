import { assert } from 'chai'
import Listener from '@lib/listener'
import Signal from '@lib/signal'
import { Component, ComponentType, ComponentManager, ComponentMapper } from '@lib/component'
import { Entity, EntityListener } from '@lib/entity'

class ComponentA implements Component {}
class ComponentB implements Component {}

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

describe('Entities', () => {

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

    // TODO
    // assert.isTrue(entity.getComponentBits().isEmpty())
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

    // TODO
    // Bits componentBits = entity.getComponentBits()
    // const componentAIndex: number = ComponentType.getIndexFor(ComponentA)

    // TODO
    // for (int i = 0; i < componentBits.length(); ++i) {
    // 	assert.equal(i == componentAIndex, componentBits.get(i));
    // }

    assert.isNotNull(am.get(entity))
    assert.isNull(bm.get(entity))
    assert.isTrue(am.has(entity))
    assert.isFalse(bm.has(entity))

    entity.remove(ComponentA.prototype as Klass<ComponentA>)
    assert.equal(0, entity.getComponents().length)

    // TODO
    // for (int i = 0; i < componentBits.length(); ++i) {
    // 	assertFalse(componentBits.get(i));
    // }

    assert.isNull(am.get(entity))
    assert.isNull(bm.get(entity))
    assert.isFalse(am.has(entity))
    assert.isFalse(bm.has(entity))
  })

})


// @Test
// public void removeUnexistingComponent () throws Exception {
// 	// ensure remove unexisting component work with
// 	// new component type at default bag limits (64)
// 	Entity entity = new Entity();

// 	ComponentClassFactory cl = new ComponentClassFactory();

// 	for(int i=0 ; i<65 ; i++){
// 		Class<? extends Component> type = cl.createComponentType("Component" + i);
// 		entity.remove(type);
// 		entity.add(type.newInstance());
// 	}
// }

// @Test
// public void addAndRemoveAllComponents () {
// 	Entity entity = new Entity();

// 	entity.add(new ComponentA());
// 	entity.add(new ComponentB());

// 	assertEquals(2, entity.getComponents().size());

// 	Bits componentBits = entity.getComponentBits();
// 	int componentAIndex = ComponentType.getIndexFor(ComponentA.class);
// 	int componentBIndex = ComponentType.getIndexFor(ComponentB.class);

// 	for (int i = 0; i < componentBits.length(); ++i) {
// 		assertEquals(i == componentAIndex || i == componentBIndex, componentBits.get(i));
// 	}

// 	assertNotNull(am.get(entity));
// 	assertNotNull(bm.get(entity));
// 	assertTrue(am.has(entity));
// 	assertTrue(bm.has(entity));

// 	entity.removeAll();

// 	assertEquals(0, entity.getComponents().size());

// 	for (int i = 0; i < componentBits.length(); ++i) {
// 		assertFalse(componentBits.get(i));
// 	}

// 	assertNull(am.get(entity));
// 	assertNull(bm.get(entity));
// 	assertFalse(am.has(entity));
// 	assertFalse(bm.has(entity));
// }

// @Test
// public void addSameComponent () {
// 	Entity entity = new Entity();

// 	ComponentA a1 = new ComponentA();
// 	ComponentA a2 = new ComponentA();

// 	entity.add(a1);
// 	entity.add(a2);

// 	assertEquals(1, entity.getComponents().size());
// 	assertTrue(am.has(entity));
// 	assertNotEquals(a1, am.get(entity));
// 	assertEquals(a2, am.get(entity));
// }

// @Test
// public void componentListener () {
// 	EntityListenerMock addedListener = new EntityListenerMock();
// 	EntityListenerMock removedListener = new EntityListenerMock();

// 	Entity entity = new Entity();
// 	entity.componentAdded.add(addedListener);
// 	entity.componentRemoved.add(removedListener);

// 	assertEquals(0, addedListener.counter);
// 	assertEquals(0, removedListener.counter);

// 	entity.add(new ComponentA());

// 	assertEquals(1, addedListener.counter);
// 	assertEquals(0, removedListener.counter);

// 	entity.remove(ComponentA.class);

// 	assertEquals(1, addedListener.counter);
// 	assertEquals(1, removedListener.counter);

// 	entity.add(new ComponentB());

// 	assertEquals(2, addedListener.counter);

// 	entity.remove(ComponentB.class);

// 	assertEquals(2, removedListener.counter);
// }

// @Test
// public void getComponentByClass () {
// 	ComponentA compA = new ComponentA();
// 	ComponentB compB = new ComponentB();

// 	Entity entity = new Entity();
// 	entity.add(compA).add(compB);

// 	ComponentA retA = entity.getComponent(ComponentA.class);
// 	ComponentB retB = entity.getComponent(ComponentB.class);

// 	assertNotNull(retA);
// 	assertNotNull(retB);

// 	assertTrue(retA == compA);
// 	assertTrue(retB == compB);
// }
