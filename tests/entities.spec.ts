import { assert } from 'chai'
import Listener from '@lib/listener'
import Signal from '@lib/signal'
import { Component } from '@lib/component'
import { Entity, EntityListener } from '@lib/entity'

// import { Engine } from '@lib/engine'
// import { System } from '@lib/system'

private static class EntityListenerMock implements Listener<Entity> {

	public int counter = 0;

	@Override
	public void receive (Signal<Entity> signal, Entity object) {
		++counter;

		assertNotNull(signal);
		assertNotNull(object);
	}
}

class ComponentA implements Component {}
class ComponentB implements Component {}


describe('Entity', () => {

})
