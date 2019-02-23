import Signal from './signal'
import Listener from './listener'
import { Component } from './component'
import { IllegalStateException } from './exceptions'

type Klass<T> = { new (...args: any[]): T }

/**
 * Simple containers of [[Component]]s that give them "data". The component's data is then processed by the [[System]]s.
 */
export class Entity {
	// Will dispatch an event when a component is added.
	componentAdded: Signal<Entity>
	// Will dispatch an event when a component is removed.
  componentRemoved: Signal<Entity>

	components: Component[] = []
  componentMap = new WeakMap()

  constructor(){
    this.componentAdded = new Signal<Entity>()
    this.componentRemoved = new Signal<Entity>()
  }

  /**
	 * Adds a [[Component]] to this Entity.
	 * @return The Entity for easy chaining
	 */
  // TODO check if same component has already been added
	public add<T extends Component>(component: Component): Entity {
    this.componentMap.set(component.constructor, component)
    this.components.push(component)
		this.notifyComponentAdded()
	  return this
	}

	/**
	 * Removes the [[Component]] of the specified type. Since there is only ever one component of one type, we don't need an
	 * instance reference.
	 * @return The removed [[Component]], or null if the Entity did no contain such a component.
	 */
	public remove<T extends Component>(klass: Klass<T>): Component | null {
    const component = this.componentMap.get(klass)
    const deleted = this.componentMap.delete(klass)
    if(deleted){
      this.notifyComponentRemoved()
      return component
    } else {
      return null
    }
	}

	/** Removes all the [[Components]] from the Entity. */
  // TODO
	public removeAll(): void {
    // this.components.forEach((c: Component) => {
    //   this.remove(c)
    // })
	}

	/**
	 * Retrieve a component from this {@link Entity} by class. <em>Note:</em> the preferred way of retrieving {@link Component}s is
	 * using {@link ComponentMapper}s. This method is provided for convenience; using a ComponentMapper provides O(1) access to
	 * components while this method provides only O(logn).
	 * @param componentClass the class of the component to be retrieved.
	 * @return the instance of the specified {@link Component} attached to this {@link Entity}, or null if no such
	 *         {@link Component} exists.
	 */
  public getComponentByClass<T extends Component>(klass: Klass<T>): T {
    return this.componentMap.get(klass)
  }


  // @return Whether or not the Entity has a {@link Component} for the specified class.
  public hasComponent<T extends Component>(klass: Klass<T>): boolean {
    return this.componentMap.has(klass)
  }

  notifyComponentAdded(): void {
    this.componentAdded.dispatch(this)
  }

  notifyComponentRemoved(): void {
    this.componentRemoved.dispatch(this)
  }
}


// Manages the addition / removal of entity
export class EntityManager {
	private listener: EntityListener
	private entities: Entity[] = []

	constructor(listener: EntityListener) {
		this.listener = listener
	}

	public addEntity(entity: Entity): void {
    if(this.entities.indexOf(entity) > -1){
      throw new IllegalStateException("Entity has already been added \n" + entity)
    }
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

// Get notified of [[Entity]] related events.
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
