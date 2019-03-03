import Signal from './Signal'
import Listener from './Listener'

import Component from './Component'
import ComponentManager from './ComponentManager'

import Family from './Family'
import FamilyManager from './FamilyManager'

import Entity from './Entity'
import EntityListener  from './EntityListener'
import EntityManager  from './EntityManager'

import System from './System'
import SystemListener from './SystemListener'
import SystemManager from './SystemManager'

type Klass<T> = { new (...args: any[]): T }
import { IllegalStateException } from './exceptions'

/**
 * [[System]]s have no state and [[Component]]s have no behavior!!!!!


 * The heart of the Entity framework. It is responsible for keeping track of[[Entity]] and
 * managing [[System]] objects. The Engine should be updated every tick via the {@link #update(float)} method.
 *
 * With the Engine you can:
 *
 * <ul>
 * <li>Add/Remove[[Entity]] objects</li>
 * <li>Add/Remove [[System]]s</li>
 * <li>Obtain a list of entities for a specific [[Family]]</li>
 * <li>Update the main loop</li>
 * <li>Register/unregister [[EntityListener]] objects</li>
 * </ul>
 *
 */
export default class Engine {
  // private static Family empty = Family.all().get();

  private componentAdded: Listener<Entity>  = new ComponentListener(this)
  private componentRemoved:  Listener<Entity>  = new ComponentListener(this)

  private systemManager: SystemManager = new SystemManager(new EngineSystemListener(this))
  private entityManager: EntityManager = new EntityManager(new EngineEntityListener(this))
  public familyManager: FamilyManager = new FamilyManager(this.entityManager.getEntities())
  private componentManager: ComponentManager = new ComponentManager()

  private updating: boolean

  constructor(){}



  /**
   * Creates a new Entity object.
   * @return [[Entity]]
   */
  public createEntity(): Entity {
  	return new Entity()
  }

  /**
   * Adds an [[Entity]] to the Engine.
   * This will throw an IllegalArgumentException if the given entity
   * was already registered with an engine.
   */
  public addEntity(entity: Entity): void {
  	this.entityManager.addEntity(entity)
  }

  /**
   * Removes an [[Entity]] from the Engine.
   */
  public removeEntity(entity: Entity): void{
  	this.entityManager.removeEntity(entity)
  }

  /**
   * Removes all [[Entity]]s registered with this Engine.
   */
  public removeAllEntities(): void {
  	this.entityManager.removeAllEntities()
  }

  /**
   * Removes all [[Entity]]s of the given [[Family]]
   */
  // TODO
  // public removeAllEntities(family: Family): void {
  // 	this.entityManager.removeAllEntities(getEntitiesFor(family))
  // }


  /**
   * Get all [[Entity]]s
   */
  public getEntities(): Entity[] {
  	return this.entityManager.getEntities()
  }

  /**
   * Adds the [[System]] to the Engine.
   * If the Engine already had a system of the same class,
   * the new one will replace the old one.
   */
  public addSystem(system: System): void {
  	this.systemManager.addSystem(system)
  }

  /**
   * Removes a [[System]] from the Engine.
   */
  public removeSystem(system: System): void {
  	this.systemManager.removeSystem(system)
  }

  /**
   * Removes all [[System]]s from this Engine.
   */
  public removeAllSystems(): void {
  	this.systemManager.removeAllSystems()
  }

  /**
   * Get a [[System]] by Class.
   */
  public getSystem<T extends System>(systemClass: Klass<T>): T {
  	return this.systemManager.getSystem(systemClass)
  }

  /**
   * @return array of all [[System]]s managed by the [[Engine]]
   */
  public getSystems(): System[] {
  	return this.systemManager.getSystems()
  }

  /**
   * Returns collection of entities for the specified [[Family]].
   */
  public getEntitiesFor(family: Family): Entity[]{
  	return this.familyManager.getEntitiesFor(family)
  }

  public getFamilyFor(components: string[]): Family {
  	return this.familyManager.getOrCreateFamily(components)
  }


  /**
   * Adds an [[EntityListener]] for a specific [[Family]]. The listener will be notified every time an entity is
   * added/removed to/from the given family. The priority determines in which order the entity listeners will be called. Lower
   * value means it will get executed first.
   */
  public addEntityListener(listener: EntityListener, priority: number = 0, family?: Family): void {
    this.familyManager.addEntityListener(listener, priority, family)
  }

  /**
   * Removes an [[EntityListener]]
   */
  public removeEntityListener(listener: EntityListener): void {
  	this.familyManager.removeEntityListener(listener)
  }

  /**
   * Updates all the [[System]] in this Engine.
   * @param deltaTime The time passed since the last frame.
   */
  public update(deltaTime: number): void{
  	if(this.updating){
  		throw new IllegalStateException("Cannot call update() on an Engine that is already updating.")
  	}

  	this.updating = true
  	const systems: System[] = this.systemManager.getSystems()

  	try {
      systems.forEach((system: System) => {
  			if(system.checkProcessing()) {
  				system.update(deltaTime)
  			}
      })
  	}
  	finally {
  		this.updating = false
  	}
  }

  // TODO these used to be protected, js doesnt have nested classes -> at bottom
  public addEntityInternal(entity: Entity): void {
  	entity.componentAdded.add(this.componentAdded)
  	entity.componentRemoved.add(this.componentRemoved)

  	this.familyManager.updateFamilyMembership(entity)
  }

  public removeEntityInternal(entity: Entity): void {
  	this.familyManager.updateFamilyMembership(entity)
  	entity.componentAdded.remove(this.componentAdded)
  	entity.componentRemoved.remove(this.componentRemoved)
  }
}


class EngineSystemListener implements SystemListener {
  engine: Engine
  constructor(engine: Engine){
    this.engine = engine
  }
	public systemAdded(system: System): void {
		system.addedToEngineInternal(this.engine)
	}

	public systemRemoved(system: System): void {
		system.removedFromEngineInternal(this.engine)
	}
}

class EngineEntityListener implements EntityListener {
  engine: Engine
  constructor(engine: Engine){
    this.engine = engine
  }

	public entityAdded(entity: Entity): void {
		this.engine.addEntityInternal(entity)
	}

	public entityRemoved(entity: Entity): void {
		this.engine.removeEntityInternal(entity)
	}
}


class ComponentListener implements Listener<Entity> {
  engine: Engine
  constructor(engine: Engine){
    this.engine = engine
  }

	public receive(signal: Signal<Entity>, entity: Entity): void {
		this.engine.familyManager.updateFamilyMembership(entity)
	}
}
