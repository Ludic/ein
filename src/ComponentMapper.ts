import Component from './Component'
import ComponentType from './ComponentType'
import Entity from './Entity'

interface Klass<T> { new(): T }

/**
 * Provides super fast {@link Component} retrieval from {@Link Entity} objects.
 * @param <T> the class type of the {@link Component}.
 * @author David Saltares
 */
export default class ComponentMapper<T extends Component> {
	private componentType: ComponentType

  constructor(componentClass: Klass<T>){
		this.componentType = ComponentType.getFor(componentClass)
  }

	/**
	 * @param componentClass Component class to be retrieved by the mapper.
	 * @return New instance that provides fast access to the {@link Component} of the specified class.
	 */
	public static getFor<T extends Component>(componentClass: Klass<T>): ComponentMapper<T> {
		return new ComponentMapper<T>(componentClass)
	}

	/** @return The {@link Component} of the specified class belonging to entity. */
	public get<T extends Component>(entity: Entity): T | null {
		return entity.getComponent<T>(this.componentType)
	}

	/** @return Whether or not entity has the component of the specified class. */
	public has(entity: Entity): boolean {
		return entity.hasComponent(this.componentType)
	}
}
