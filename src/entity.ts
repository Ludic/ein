import Signal from './signal'
import Listener from './listener'
import { Component } from './component'

/**
 * Simple containers of [[Component]]s that give them "data". The component's data is then processed by the [[System]]s.
 */
export class Entity {
	/** Will dispatch an event when a component is added. */
	componentAdded: Signal<Entity>
	/** Will dispatch an event when a component is removed. */
  componentRemoved: Signal<Entity>

	components: Component[]

  constructor(){
    this.components = []

    this.componentAdded = new Signal<Entity>()
    this.componentRemoved = new Signal<Entity>()
  }


  /**
	 * Adds a [[Component]] to this Entity.
	 * @return The Entity for easy chaining
	 */
  // TODO check if same component has already been added
	public add(component: Component): Entity {
    this.components.push(component)
		this.notifyComponentAdded()
	  return this
	}

	/**
	 * Removes the [[Component]] of the specified type. Since there is only ever one component of one type, we don't need an
	 * instance reference.
	 * @return The removed [[Component]], or null if the Entity did no contain such a component.
	 */
	public remove(component: Component): Component | null {
    const i = this.components.indexOf(component)
    if(i > -1){
      this.components.splice(i, 1)
      this.notifyComponentRemoved()
      return component
    } else {
      return null
    }
	}

	/** Removes all the [[Components]] from the Entity. */
	public removeAll(): void {
    this.components.forEach((c: Component) => {
      this.remove(c)
    })
	}

	/**
	 * Retrieve a component from this {@link Entity} by class. <em>Note:</em> the preferred way of retrieving {@link Component}s is
	 * using {@link ComponentMapper}s. This method is provided for convenience; using a ComponentMapper provides O(1) access to
	 * components while this method provides only O(logn).
	 * @param componentClass the class of the component to be retrieved.
	 * @return the instance of the specified {@link Component} attached to this {@link Entity}, or null if no such
	 *         {@link Component} exists.
	 */
  // TODO idk how to pass in a fucking class def
	// public getComponentByClass<T>(componentClass: typeof class<T>): Component | null {
  //   // return this.components.find((c: Component) => c instanceof componentClass)
  //   return null
	// }

	/**
	 * @return Whether or not the Entity has a {@link Component} for the specified class.
	 */
  // TODO ^^
	// public hasComponent<T>(componentClass: new() => Component<T>): Component<T> {
  //   return !!this.getComponentByClass(componentClass)
	// }

	notifyComponentAdded(): void {
		this.componentAdded.dispatch(this)
	}

	notifyComponentRemoved(): void {
		this.componentRemoved.dispatch(this)
	}
}


/**
 * Manages the addition / removal of entity
 **/
export class EntityManager {
	private listener: EntityListener
	private entities: Entity[] = []

	constructor(listener: EntityListener) {
		this.listener = listener
	}

	public addEntity(entity: Entity): void {

    // TODO
		// if (entitySet.contains(entity)) {
		// 	throw new IllegalArgumentException("Entity is already registered " + entity);
		// }

		this.entities.push(entity)
		this.listener.entityAdded(entity)
	}

	public removeEntity(entity: Entity): void {
    const i = this.entities.indexOf(entity)
    if(i > -1){
		  this.entities.splice(i, 1)
      this.listener.entityRemoved(entity)
    }
	}

	public removeAllEntities(): void {
    this.entities = []
	}

  public getEntities(): Entity[] {
    return this.entities
  }
}

/**
 * Get notified of [[Entity]] related events.
 */
export interface EntityListener {
	/**
	 * Called whenever an [[Entity]] is added to {@link Engine} or a specific {@link Family} See
	 * {@link Engine#addEntityListener(EntityListener)} and {@link Engine#addEntityListener(Family, EntityListener)}
	 * @param entity
	 */
	entityAdded(entity: Entity): void

	/**
	 * Called whenever an [[Entity]] is removed from {@link Engine} or a specific {@link Family} See
	 * {@link Engine#addEntityListener(EntityListener)} and {@link Engine#addEntityListener(Family, EntityListener)}
	 * @param entity
	 */
	entityRemoved(entity: Entity): void
}
