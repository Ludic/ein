import { Entity } from './entity'
// type Klass<T> = { new (...args: any[]): T }
/**
 * Interface for all Components. A Component is intended as a data holder and provides data to be processed in an
 * [[System]]. But do as you wish.
 * [[System]]s have no state and [[Component]]s have no behavior!!!!!
 */

interface Klass<T> {
  new(): T
}

export class Component {}

/**
 * Does things when you add / remove [[Components]] from [[Entities]]
 */
export class ComponentManager {
  constructor(){}

  public add(entity: Entity): void {
		entity.notifyComponentAdded()
  }

  public remove(entity: Entity): void {
		entity.notifyComponentRemoved()
  }
}


/**
 * Uniquely identifies a {@link Component} sub-class. It assigns them an index which is used internally for fast comparison and
 * retrieval. See {@link Family} and {@link Entity}. ComponentType is a package protected class. You cannot instantiate a
 * ComponentType. They can only be accessed via {@link #getIndexFor(Class<? extends Component>)}. Each component class will always
 * return the same instance of ComponentType.
 * @author Stefan Bachmann
 */
export class ComponentType {
  // componentInstance.constructor -> ComponentType
  private static classMap = new WeakMap
  // private static ObjectMap<Class<? extends Component>, ComponentType> assignedComponentTypes = new ObjectMap<Class<? extends Component>, ComponentType>();
  private static typeIndex: number = 0
	private index: number

	constructor(){
		this.index = ComponentType.typeIndex++
	}

	/** @return This ComponentType's unique index */
	public getIndex(): number {
		return this.index
	}

	/**
	 * @param componentType The {@link Component} class
	 * @return A ComponentType matching the Component Class
	 */
	public static getFor<T>(componentConstructor: Klass<T>): ComponentType {
		let componentType: ComponentType = ComponentType.classMap.get(componentConstructor)

		if(!componentType){
			componentType = new ComponentType()
      ComponentType.classMap.set(componentConstructor, componentType)
		}

		return componentType
	}

	/**
	 * Quick helper method. The same could be done via {@link ComponentType.getFor(Class<? extends Component>)}.
	 * @param componentType The {@link Component} class
	 * @return The index for the specified {@link Component} Class
	 */
	public static getIndexFor<T>(componentConstructor: Klass<T>): number {
		return this.getFor(componentConstructor).getIndex()
	}

	/**
	 * @param componentTypes list of {@link Component} classes
	 * @return Bits representing the collection of components for quick comparison and matching. See
	 *         {@link Family#getFor(Bits, Bits, Bits)}.
	 */

  // TODO return Bits()
	public static getBitsFor<T extends Component>(componentConstructors: Array<Klass<T>>): number[] {
    return []

	  // Bits bits = new Bits();

		// int typesLength = componentTypes.length;
		// for (int i = 0; i < typesLength; i++) {
		// 	bits.set(ComponentType.getIndexFor(componentTypes[i]));
		// }

		// return bits;
	}


	public hashCode(): number {
		return this.index
	}

	public equals(obj: Object): boolean {
		if(this == obj) return true
		if(obj == null) return false
		if(this.constructor.name != obj.constructor.name) return false
		let other: ComponentType = obj as ComponentType
		return this.index == other.index;
	}
}
