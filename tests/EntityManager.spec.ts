import { assert } from 'chai'
import Entity from '../src/Entity'
import EntityManager from '../src/EntityManager'
import EntityListener from '../src/EntityListener'
import { IllegalStateException } from '../src/exceptions'
import Engine from '../src/Engine'

class EntityListenerMock implements EntityListener {
  public addedCount: number = 0
	public removedCount: number = 0

	public entityAdded(entity: Entity): void {
		this.addedCount++
    assert.isNotNull(entity)
	}

	public entityRemoved(entity: Entity): void {
		this.removedCount++
		assert.isNotNull(entity)
  }
}

describe('EntityManager', () => {

  it('addEntity() and removeEntity()', async () => {
    const listener: EntityListenerMock = new EntityListenerMock()
		const manager: EntityManager = new EntityManager(listener)

		const entity1: Entity = new Entity()
		manager.addEntity(entity1)

		assert.equal(1, listener.addedCount)
		const entity2: Entity = new Entity()
		manager.addEntity(entity2)

		assert.equal(2, listener.addedCount)

		manager.removeAllEntities()
    assert.equal(2, listener.removedCount)
  })

  it('getEntities()', async () => {
    const numEntities: number = 10
    const listener: EntityListenerMock = new EntityListenerMock()
		const manager: EntityManager = new EntityManager(listener)

		let entities: Entity[] = new Array<Entity>()

		for(let i=0; i<numEntities; ++i) {
			let entity: Entity = new Entity()
			entities.push(entity)
			manager.addEntity(entity)
		}

		let engineEntities: Entity[] = manager.getEntities()

		assert.equal(entities.length, engineEntities.length)

		for(let i = 0; i < numEntities; ++i) {
			assert.equal(entities[i], engineEntities[i])
		}

		manager.removeAllEntities()
    assert.equal(0, engineEntities.length)
  })

  it('removeAll()', async () => {
    const numEntities: number = 10
    const listener: EntityListenerMock = new EntityListenerMock()
		const manager: EntityManager = new EntityManager(listener)

	  const entity1: Entity = new Entity()
    const entity2: Entity = new Entity()
	  manager.addEntity(entity1)
    manager.addEntity(entity2)

    assert.equal(manager.getEntities().length, 2)

    manager.removeAllEntities()
    assert.equal(manager.getEntities().length, 0)
  })

  it('should throw when adding the same entity twice', async () => {
    const numEntities: number = 10
    const listener: EntityListenerMock = new EntityListenerMock()
		const manager: EntityManager = new EntityManager(listener)

	  const entity: Entity = new Entity()
	  manager.addEntity(entity)

    try {
      manager.addEntity(entity)
    } catch(e){
      assert.isTrue(e instanceof IllegalStateException)
    }
  })

})
