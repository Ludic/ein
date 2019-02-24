import Signal from './signal'
import Listener from './listener'
import { Component, ComponentType } from './component'
import { IllegalStateException } from './exceptions'

interface Klass<T> {
  new(): T
}

/**
 * Simple containers of [[Component]]s that give them "data". The component's data is then processed by the [[System]]s.
 */
export class Entity {
	// Will dispatch an event when a component is added.
	componentAdded: Signal<Entity>
	// Will dispatch an event when a component is removed.
  componentRemoved: Signal<Entity>

  // ComponentType.index  -> Component
  componentMap = new Map()
  components: Component[] = []

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
    if(this.addInternal(component)){
      this.notifyComponentAdded()
		}
	  return this
	}

  /**
	 * Adds a {@link Component} to this Entity. If a {@link Component} of the same type already exists, it'll be replaced.
	 * @return The Component for direct component manipulation (e.g. PooledComponent)
	 */
	public addAndReturn(component: Component): Component {
	  this.add(component)
		return component
  }

	/**
	 * Removes the [[Component]] of the specified type. Since there is only ever one component of one type, we don't need an
	 * instance reference.
	 * @return The removed [[Component]], or null if the Entity did no contain such a component.
	 */
  public remove<T extends Component>(componentClass: Klass<T>): Component | null {
		const componentType: ComponentType = ComponentType.getFor(componentClass)
		const componentTypeIndex: number = componentType.getIndex()

		const removeComponent: Component = this.componentMap.get(componentTypeIndex)
		if(removeComponent != null && this.removeInternal(componentClass) != null) {
			this.notifyComponentRemoved()
		}
		return removeComponent
  }

	/** Removes all the [[Components]] from the Entity. */
  public removeAll(): void {
    this.components.forEach((c: Component) => {
      this.remove(c.constructor.prototype)
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
  public getComponentForClass<T extends Component>(componentClass: Klass<T>): T | null {
	  return this.getComponent(ComponentType.getFor(componentClass))
  }

  public getComponent<T extends Component>(componentType: ComponentType): T | null {
	  const componentTypeIndex: number = componentType.getIndex()
	  if (componentTypeIndex < this.components.length) {
		  return this.componentMap.get(componentType.getIndex())
	  } else {
		  return null
	  }
  }

  // @return Whether or not the Entity has a {@link Component} for the specified class.
  public hasComponent(componentType: ComponentType): boolean {
    return this.componentMap.has(componentType)
  }

  notifyComponentAdded(): void {
    this.componentAdded.dispatch(this)
  }

  notifyComponentRemoved(): void {
    this.componentRemoved.dispatch(this)
  }


  /**
   * @param component
   * @return whether or not the component was added.
   */
  addInternal(component: Component): boolean {
	  const componentClass = component.constructor.prototype
	  const oldComponent: Component | null = this.getComponentForClass(componentClass)

	  if(component == oldComponent){
		  return false
	  }

    // TODO
	  // if(oldComponent != null){
	  // 	this.removeInternal(componentClass)
	  // }

	  const componentTypeIndex: number = ComponentType.getIndexFor(componentClass)
	  this.componentMap.set(componentTypeIndex, component)
	  this.components.push(component)
    // TODO
	  // componentBits.set(componentTypeIndex);

	  return true
  }

  /**
   * @param componentClass
   * @return the component if the specified class was found and removed. Otherwise, null
   */
  removeInternal<T>(componentClass: Klass<T>): Component | null {
	  const componentType: ComponentType = ComponentType.getFor(componentClass)
	  const componentTypeIndex: number = componentType.getIndex();
	  const removeComponent: Component = this.componentMap.get(componentTypeIndex)

	  if(removeComponent != null){
		  this.componentMap.set(componentTypeIndex, null)

      // TODO -> Is the componentTypeIndex the same here?
		  this.components = this.components.splice(this.components.indexOf(removeComponent), 1)

      // TODO
		  // componentBits.clear(componentTypeIndex);

		  return removeComponent
	  }

	  return null
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
