import { assert } from 'chai'
import SystemManager from '../src/SystemManager'
import System from '../src/System'
import SystemListener from '../src/SystemListener'
import Engine from '../src/Engine'

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

  it('add two systems of the same Class', async () => {
    let system1: SystemMockA = new SystemMockA()
    let system2: SystemMockA = new SystemMockA()

		let systemSpy: SystemListenerSpy = new SystemListenerSpy()
		let manager: SystemManager = new SystemManager(systemSpy)

    assert.equal(0, manager.getSystems().length)

		manager.addSystem(system1)

		assert.equal(1, manager.getSystems().length)
		assert.equal(system1, manager.getSystem(SystemMockA))
		assert.equal(1, systemSpy.addedCount)

		manager.addSystem(system2)

		assert.equal(1, manager.getSystems().length)
		assert.equal(system2, manager.getSystem(SystemMockA))
		assert.equal(2, systemSpy.addedCount)
    assert.equal(1, systemSpy.removedCount)
  })

  it('should update systems in order', async() => {
    let updates: number[] = []

		let systemSpy:SystemListenerSpy = new SystemListenerSpy()
		let manager: SystemManager = new SystemManager(systemSpy)
		let system1: SystemMockA = new SystemMockA(updates)
		let system2: SystemMockB = new SystemMockB(updates)

		system1.priority = 2
		system2.priority = 1

		manager.addSystem(system1)
		manager.addSystem(system2)

		let systems: System[] = manager.getSystems()
		assert.equal(system2, systems[0])
    assert.equal(system1, systems[1])
  })

})
