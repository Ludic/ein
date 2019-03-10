import Component from './Component'
import Bits from './Bits'

interface Klass<T> { new(): T }

/**
 * Uniquely identifies a {@link Component} sub-class. It assigns them an index which is used internally for fast comparison and
 * retrieval. See {@link Family} and {@link Entity}. ComponentType is a package protected class. You cannot instantiate a
 * ComponentType. They can only be accessed via {@link #getIndexFor(Class<? extends Component>)}. Each component class will always
 * return the same instance of ComponentType.
 * @author Stefan Bachmann
 */
export default class ComponentType {
  private static classMap = new WeakMap<Klass<any>, ComponentType>()
  private static typeIndex: number = 0
	private index: number

	constructor(){
		this.index = ComponentType.typeIndex++
	}

	/** @return This ComponentType's unique index */
	public getIndex(): number {
		return this.index
	}

	public static reset(): void {
		this.typeIndex = 0
	}

	/**
	 * @param componentType The {@link Component} class
	 * @return A ComponentType matching the Component Class
	 */
	public static getFor<T>(componentClass: Klass<T>): ComponentType {
		let componentType: ComponentType | undefined = ComponentType.classMap.get(componentClass)

		if(!componentType){
			componentType = new ComponentType()
      ComponentType.classMap.set(componentClass, componentType)
		}

		return componentType
	}

	/**
	 * Quick helper method. The same could be done via {@link ComponentType.getFor(Class<? extends Component>)}.
	 * @param componentType The {@link Component} class
	 * @return The index for the specified {@link Component} Class
	 */
	public static getIndexFor<T>(componentClass: Klass<T>): number {
		return this.getFor(componentClass).getIndex()
	}

	/**
	 * @param componentTypes list of {@link Component} classes
	 * @return Bits representing the collection of components for quick comparison and matching. See
	 *         {@link Family#getFor(Bits, Bits, Bits)}.
	 */
	public static getBitsFor<T extends Component>(componentClasses: Array<Klass<T>>): Bits {
	  let bits: Bits = new Bits()

		const typesLength: number = componentClasses.length
		for(let i=0; i<typesLength; i++){
			bits.set(ComponentType.getIndexFor(componentClasses[i]))
		}

		return bits
	}


	public hashCode(): number {
		return this.index
	}

	public equals(obj: Object): boolean {
		if(this == obj) return true
		if(obj == null) return false
		if(this.constructor.prototype != obj.constructor.prototype) return false
		let other: ComponentType = obj as ComponentType
		return this.index == other.index;
	}
}
