import Bits from './Bits'
import Component from './Component'
import ComponentType from './ComponentType'
import Entity from './Entity'

type Klass<T> = { new (...args: any[]): T }

/**
 * Represents a group of [[Component]]s. It is used to describe what [[Entity]] objects a [[System]] should
 * process. Example: {@code Family.all(PositionComponent.class, VelocityComponent.class).get()} Families can't be instantiated
 * directly but must be accessed via a builder ( start with {@code Family.all()}, {@code Family.one()} or {@code Family.exclude()}
 * ), this is to avoid duplicate families that describe the same components.
 */

export default class Family {
  components: Component[]
  entities: Entity[]
  constructor(components: Component[] = [], entities: Entity[] = []){
    this.components = components
    this.entities = entities
  }

  static Builder = class {
    private allBits: Bits = ZERO_BITS
	  private oneBits: Bits = ZERO_BITS
	  private excludeBits: Bits = ZERO_BITS

	  Builder() {

	  }

	  /**
	   * Resets the builder instance
	   * @return A Builder singleton instance to get a family
	   */
	  public reset(): FamilyBuilder {
		  this.allBits = ZERO_BITS
		  this.oneBits = ZERO_BITS
		  this.excludeBits = ZERO_BITS
		  return this
	  }

	  /**
	   * @param componentTypes entities will have to contain all of the specified components.
	   * @return A Builder singleton instance to get a family
	   */
	  public all<T extends Component>(componentClasses: Array<Klass<T>>): FamilyBuilder {
		  this.allBits = ComponentType.getBitsFor(componentClasses)
		  return this
	  }

	  /**
	   * @param componentTypes entities will have to contain at least one of the specified components.
	   * @return A Builder singleton instance to get a family
	   */
	  public one<T extends Component>(componentClasses: Array<Klass<T>>): FamilyBuilder {
		  this.oneBits = ComponentType.getBitsFor(componentClasses)
		  return this
	  }

	  /**
	   * @param componentTypes entities cannot contain any of the specified components.
	   * @return A Builder singleton instance to get a family
	   */
	  public exclude<T extends Component>(componentClasses: Array<Klass<T>>): FamilyBuilder {
		  this.excludeBits = ComponentType.getBitsFor(componentClasses)
		  return this
	  }

	  /** @return A family for the configured component types */
	  public get(): Family {
		  const hash: string = this.getFamilyHash(this.allBits, this.oneBits, this.excludeBits)
		  let family: Family = this.families.get(hash, null)
		  if(family == null) {
			  family = new Family(this.allBits, this.oneBits, this.excludeBits)
			  this.families.put(hash, family)
		  }
		  return family;
	  }


  }
}
