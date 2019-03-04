import Bits from './Bits'
import Signal from './Signal'
import Listener from './Listener'
import Component from './Component'
import ComponentType from './ComponentType'

interface Klass<T> { new(): T }

/**
 * Simple containers of [[Component]]s that give them "data". The component's data is then processed by the [[System]]s.
 */
export default class Entity {
  // A flag that can be used to bit mask this entity. Up to the user to manage.
  public flags: number
	// Will dispatch an event when a component is added.
	public componentAdded: Signal<Entity>
	// Will dispatch an event when a component is removed.
  public componentRemoved: Signal<Entity>

  // ComponentType.index  -> Component
  private componentMap = new Map()
  private components: Component[] = []

  private componentBits: Bits
  private familyBits: Bits
  constructor(){
    this.componentBits = new Bits()
		this.familyBits = new Bits()
    this.flags = 0

    this.componentAdded = new Signal<Entity>()
    this.componentRemoved = new Signal<Entity>()
  }

  /**
	 * Adds a [[Component]] to this Entity.
	 * @return The Entity for easy chaining
	 */
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
    while(this.components.length){
      this.remove(this.components[0].constructor.prototype)
    }
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

  public getComponents(): Component[] {
    return this.components
  }

  // @return Whether or not the Entity has a {@link Component} for the specified class.
  public hasComponent(componentType: ComponentType): boolean {
    return this.componentBits.get(componentType.getIndex())
    // return this.componentMap.has(componentType.getIndex())
  }

  /**
	 * @return This Entity's component bits, describing all the {@link Component}s it contains.
	 */
	getComponentBits(): Bits {
		return this.componentBits
	}

	/** @return This Entity's {@link Family} bits, describing all the {@link EntitySystem}s it currently is being processed by. */
	getFamilyBits(): Bits {
		return this.familyBits
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

	  if(oldComponent != null){
	  	this.removeInternal(componentClass)
	  }

	  const componentTypeIndex: number = ComponentType.getIndexFor(componentClass)
	  this.componentMap.set(componentTypeIndex, component)
	  this.components.push(component)
	  this.componentBits.set(componentTypeIndex)

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

      // TODO Ashley sets this to null, instead of removing
		  this.componentMap.delete(componentTypeIndex)

      // TODO -> Is the componentTypeIndex the same here?
		  this.components.splice(this.components.indexOf(removeComponent), 1)
		  this.componentBits.clear(componentTypeIndex)

		  return removeComponent
	  }

	  return null
  }
}
