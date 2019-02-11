import Signal from './signal'
import Listener from './listener'

import { IllegalStateException } from './exceptions'
import { Component, ComponentManager } from './component'
import { Entity, EntityListener, EntityManager } from './entity'
import { System, SystemListener, SystemManager } from './system'
import { Family, FamilyManager } from './family'


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
 * <li>Obtain a list of entities for a specific {@link Family}</li>
 * <li>Update the main loop</li>
 * <li>Register/unregister [[EntityListener]] objects</li>
 * </ul>
 *
 */
export class Engine {
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
   * @return @[[Entity]]
   */
  public createEntity(): Entity {
  	return new Entity()
  }


  /**
   * Creates a new [[Component]]. To use that method your components must have a visible no-arg constructor
   */
  // TODO
  // public  createComponent(componentType: Class<T>): <T extends Component> T {
  // 	try {
  // 		return ClassReflection.newInstance(componentType);
  // 	} catch (ReflectionException e) {
  // 		return null;
  // 	}
  // }

  /**
   * Adds an entity to this Engine.
   * This will throw an IllegalArgumentException if the given entity
   * was already registered with an engine.
   */
  public addEntity(entity: Entity): void {
  	this.entityManager.addEntity(entity)
  }

  /**
   * Removes an [[Entity]] from the [[Engine]]
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
   * Returns an {@link ImmutableArray} of[[Entity]] that is managed by the the Engine
   *  but cannot be used to modify the state of the Engine. This Array is not Immutable in
   *  the sense that its contents will not be modified, but in the sense that it only reflects
   *  the state of the engine.
   *
   * The Array is Immutable in the sense that you cannot modify its contents through the API of
   *  the {@link ImmutableArray} class, but is instead "Managed" by the Engine itself. The engine
   *  may add or remove items from the array and this will be reflected in the returned array.
   *
   * This is an important note if you are looping through the returned entities and calling operations
   *  that may add/remove entities from the engine, as the underlying iterator of the returned array
   *  will reflect these modifications.
   *
   * The returned array will have entities removed from it if they are removed from the engine,
   *   but there is no way to introduce new Entities through the array's interface, or remove
   *   entities from the engine through the array interface.
   *
   *  Discussion of this can be found at https://github.com/libgdx/ashley/issues/224
   *
   * @return An unmodifiable array of entities that will match the state of the entities in the
   *  engine.
   */
  public getEntities(): Entity[] {
  	return this.entityManager.getEntities()
  }

  /**
   * Adds the [[System]] to this Engine.
   * If the Engine already had a system of the same class,
   * the new one will replace the old one.
   */
  public addSystem(system: System): void{
  	this.systemManager.addSystem(system)
  }

  /**
   * Removes the [[System]] from this Engine.
   */
  public removeSystem(system: System): void{
  	this.systemManager.removeSystem(system)
  }

  /**
   * Removes all [[System]]s from this Engine.
   */
  public removeAllSystems(): void {
  	this.systemManager.removeAllSystems()
  }

  // 	/**
  // 	 * Quick [[System]] retrieval.
  // 	 */
  // 	@SuppressWarnings("unchecked")
  // 	public <T extends EntitySystem> T getSystem(Class<T> systemType) {
  // 		return systemManager.getSystem(systemType);
  // 	}

  /**
   * @return immutable array of all [[System]]s managed by the [[Engine]]
   */
  public getSystems(): System[] {
  	return this.systemManager.getSystems()
  }

  // 	/**
  // 	 * Returns immutable collection of entities for the specified {@link Family}. Will return the same instance every time.
  // 	 */
  // TODO
  // public getEntitiesFor(family: Family): Entity[]{
  // 	return this.familyManager.getEntitiesFor(family)
  // }

  /**
   * Adds an [[EntityListener]].
   *
   * The listener will be notified every time an entity is added/removed to/from the engine.
   */
  // TODO
  // public addEntityListener(listener: EntityListener): void {
  // 	this.addEntityListener(empty, 0, listener)
  // }

  /**
   * Adds an [[EntityListener]]. The listener will be notified every time an entity is added/removed
   * to/from the engine. The priority determines in which order the entity listeners will be called. Lower
   * value means it will get executed first.
   */
  // TODO
  // public addEntityListener(priority: number, listener: EntityListener): void {
  // 	this.addEntityListener(empty, priority, listener)
  // }

  /**
   * Adds an [[EntityListener]] for a specific {@link Family}.
   *
   * The listener will be notified every time an entity is added/removed to/from the given family.
   */
  // TODO
  // public addEntityListener(family: Family, listener: EntityListener): void {
  // 	this.addEntityListener(family, 0, listener)
  // }

  /**
   * Adds an [[EntityListener]] for a specific {@link Family}. The listener will be notified every time an entity is
   * added/removed to/from the given family. The priority determines in which order the entity listeners will be called. Lower
   * value means it will get executed first.
   */
  public addEntityListener(family: Family, priority: number = 0, listener: EntityListener): void {
  	// this.familyManager.addEntityListener(family, priority, listener)
  }

  /**
   * Removes an [[EntityListener]]
   */
  // TODO
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
    // TODO
		// this.engine.familyManager.updateFamilyMembership(entity)
	}
}
