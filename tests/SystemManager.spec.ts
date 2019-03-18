import { assert } from 'chai'
import Listener from '@lib/Listener'
import Signal from '@lib/Signal'
import Component from '@lib/Component'
import ComponentType from '@lib/ComponentType'
import ComponentManager from '@lib/ComponentManager'
import ComponentMapper from '@lib/ComponentMapper'
import Entity from '@lib/Entity'
import EntityListener from '@lib/EntityListener'
import SystemManager from '@lib/SystemManager'
import System from '@lib/System'
import SystemListener from '@lib/SystemListener'
import { IllegalStateException } from '@lib/exceptions'
import Family from '@lib/Family'
import Engine from '@lib/Engine'

class ComponentA implements Component {}
class ComponentB implements Component {}

import PositionComponent from '@tests/components/position'
import MovementComponent from '@tests/components/movement'

class SystemListenerSpy implements SystemListener {
  public addedCount: number = 0
	public removedCount: number = 0

	public systemAdded(system: System): void {
    system.addedToEngine(new Engine())
		this.addedCount++
	}

	public systemRemoved(system: System): void {
    system.removedFromEngine(new Engine())
		this.removedCount++
  }
}

class SystemMock extends System {
	public addedCalls: number = 0
	public removedCalls: number = 0

	private updates: number[]

	public constructor(updates?: number[]) {
		super()
    if(updates) this.updates = updates
	}

	public update(deltaTime: number): void {
		if (this.updates != null) {
			this.updates.push(this.priority)
		}
	}

	public addedToEngine(engine: Engine): void {
		this.addedCalls++
  }

	public removedFromEngine(engine: Engine): void {
		this.removedCalls++
  }
}


class SystemMockA extends SystemMock {
  public constructor(updates?: number[]) {
	  super(updates)
  }
}

class SystemMockB extends SystemMock {
	public constructor(updates?: number[]){
		super(updates);
	}
}

describe('SystemManager', () => {

  it('addSystem() and removeSystem()', async () => {
    let systemA: SystemMockA = new SystemMockA()
		let systemB: SystemMockB = new SystemMockB()

		let systemSpy: SystemListenerSpy = new SystemListenerSpy()
		let manager: SystemManager = new SystemManager(systemSpy)

		assert.isUndefined(manager.getSystem(SystemMockA))
		assert.isUndefined(manager.getSystem(SystemMockB))

		manager.addSystem(systemA);
		manager.addSystem(systemB);

		assert.isNotNull(manager.getSystem(SystemMockA));
		assert.isNotNull(manager.getSystem(SystemMockB));
		assert.equal(1, systemA.addedCalls);
		assert.equal(1, systemB.addedCalls);

		manager.removeSystem(systemA);
		manager.removeSystem(systemB);

		assert.isUndefined(manager.getSystem(SystemMockA));
		assert.isUndefined(manager.getSystem(SystemMockB));
		assert.equal(1, systemA.removedCalls);
		assert.equal(1, systemB.removedCalls);

		manager.addSystem(systemA);
		manager.addSystem(systemB);
		manager.removeAllSystems();

		assert.isUndefined(manager.getSystem(SystemMockA));
		assert.isUndefined(manager.getSystem(SystemMockB));
		assert.equal(2, systemA.removedCalls);
    assert.equal(2, systemB.removedCalls);

  })


  it('getSystems()', async () => {
    let systemA: SystemMockA = new SystemMockA()
		let systemB: SystemMockB = new SystemMockB()

		let systemSpy: SystemListenerSpy = new SystemListenerSpy()
		let manager: SystemManager = new SystemManager(systemSpy)

		assert.equal(0, manager.getSystems().length);

		manager.addSystem(systemA);
		manager.addSystem(systemB);

		assert.equal(2, manager.getSystems().length);
		assert.equal(2, systemSpy.addedCount);

		manager.removeSystem(systemA);
		manager.removeSystem(systemB);

		assert.equal(0, manager.getSystems().length);
		assert.equal(2, systemSpy.addedCount);
    assert.equal(2, systemSpy.removedCount);

  })

  // TODO, SystemManager does not replace
  it('add two systems of the same Class', async () => {
    let system1: SystemMockA = new SystemMockA()
    let system2: SystemMockA = new SystemMockA()

		let systemSpy: SystemListenerSpy = new SystemListenerSpy()
		let manager: SystemManager = new SystemManager(systemSpy)

    assert.equal(0, manager.getSystems().length);

		manager.addSystem(system1)

		assert.equal(1, manager.getSystems().length);
		assert.equal(system1, manager.getSystem(SystemMockA));
		assert.equal(1, systemSpy.addedCount);

		manager.addSystem(system2);

		assert.equal(1, manager.getSystems().length);
		assert.equal(system2, manager.getSystem(SystemMockA));
		assert.equal(2, systemSpy.addedCount);
    assert.equal(1, systemSpy.removedCount);

  })


})
