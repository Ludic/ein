// https://github.com/libgdx/ashley/blob/master/ashley/src/com/badlogic/ashley/core/Family.java

import Bits from './Bits'
import Component from './Component'
import ComponentType from './ComponentType'
import Entity from './Entity'
import Klass from './Klass'

/**
 * Represents a group of [[Component]]s. It is used to describe what [[Entity]] objects a [[System]] should
 * process. Example: {@code Family.all(PositionComponent.class, VelocityComponent.class).get()} Families can't be instantiated
 * directly but must be accessed via a builder ( start with {@code Family.all()}, {@code Family.one()} or {@code Family.exclude()}
 * ), this is to avoid duplicate families that describe the same components.
 */
const ZERO_BITS = new Bits()

export default class Family {
  static Builder = class {
	  allBits: Bits = ZERO_BITS
	  oneBits: Bits = ZERO_BITS
	  excludeBits: Bits = ZERO_BITS


	  /**
	   * Resets the builder instance
	   * @return A Builder singleton instance to get a family
	   */
	  public reset() {
		  this.allBits = ZERO_BITS
		  this.oneBits = ZERO_BITS
		  this.excludeBits = ZERO_BITS
		  return this
	  }

	  /**
	   * @param componentTypes entities will have to contain all of the specified components.
	   * @return A Builder singleton instance to get a family
	   */
	  public all(componentClasses: Array<Klass<any>>) {
		  this.allBits = ComponentType.getBitsFor(componentClasses)
		  return this
	  }

	  /**
	   * @param componentTypes entities will have to contain at least one of the specified components.
	   * @return A Builder singleton instance to get a family
	   */
	  public one(componentClasses: Array<Klass<any>>) {
		  this.oneBits = ComponentType.getBitsFor(componentClasses)
		  return this
	  }

	  /**
	   * @param componentTypes entities cannot contain any of the specified components.
	   * @return A Builder singleton instance to get a family
	   */
	  public exclude(componentClasses: Array<Klass<any>>) {
		  this.excludeBits = ComponentType.getBitsFor(componentClasses)
		  return this
	  }

	  /** @return A family for the configured component types */
	  public get(): Family {
	  	let hash: string = Family.getFamilyHash(this.allBits, this.oneBits, this.excludeBits)
	  	let family = Family.families.get(hash)
	  	if(!family){
	  		family = new Family(this.allBits, this.oneBits, this.excludeBits)
	  		Family.families.set(hash, family)
	  	}
	  	return family
	  }
  }

  private static families: Map<String, Family> = new Map<String, Family>()
	private static familyIndex: number = 0
	private static readonly builder = new Family.Builder()
	private static readonly zeroBits: Bits = new Bits()

	private allBits: Bits
	private oneBits: Bits
	private excludeBits: Bits
	private index: number

	/** Private constructor, use static method Family.getFamilyFor() */
	constructor(allBits: Bits, anyBits: Bits, excludeBits: Bits) {
		this.allBits = allBits
		this.oneBits = anyBits
		this.excludeBits = excludeBits
		this.index = Family.familyIndex++
	}

	/** @return This family's unique index */
	public getIndex(): number {
		return this.index
	}

	/** @return Whether the entity matches the family requirements or not */
	public matches(entity: Entity): boolean {
		const entityComponentBits: Bits = entity.getComponentBits()

		if (!entityComponentBits.containsAll(this.allBits)) {
			return false
		}

		if (!this.oneBits.isEmpty() && !this.oneBits.intersects(entityComponentBits)) {
			return false
		}

		if (!this.excludeBits.isEmpty() && this.excludeBits.intersects(entityComponentBits)) {
			return false
		}

		return true
	}

	/**
	 * @param componentTypes entities will have to contain all of the specified components.
	 * @return A Builder singleton instance to get a family
	 */
	public static all(componentClasses: Array<Klass<any>>) {
		return this.builder.reset().all(componentClasses)
	}

	/**
	 * @param componentTypes entities will have to contain at least one of the specified components.
	 * @return A Builder singleton instance to get a family
	 */
	public static one(componentClasses: Array<Klass<any>>) {
		return this.builder.reset().one(componentClasses)
	}

	/**
	 * @param componentTypes entities cannot contain any of the specified components.
	 * @return A Builder singleton instance to get a family
	 */
	public static exclude(componentClasses: Array<Klass<any>>) {
		return this.builder.reset().exclude(componentClasses)
	}

	public hashCode(): number {
		return this.index
	}

	public equals(family: Family): boolean {
		return this == family
	}

	private static getFamilyHash(allBits: Bits, oneBits: Bits, excludeBits: Bits): string {
		let hash = ""
		if (!allBits.isEmpty()) {
			hash = hash + "{all:" + this.getBitsString(allBits) + "}"
	  }
		if (!oneBits.isEmpty()) {
      hash = hash + "{one:" + this.getBitsString(oneBits) + "}"
		}
		if (!excludeBits.isEmpty()) {
      hash = hash + "{exclude:" + this.getBitsString(excludeBits) + "}"
		}
		return hash
	}

	private static getBitsString(bits: Bits): string {
    let bitString = ""
		const numBits: number = bits.length()
		for (let i=0; i<numBits; ++i) {
      bitString += bits.get(i) ? "1" : "0"
		}
		return bitString
  }

}


// export class Builder {
// 	private allBits: Bits = ZERO_BITS
// 	private oneBits: Bits = ZERO_BITS
// 	private excludeBits: Bits = ZERO_BITS

// 	constructor(){}

// 	/**
// 	 * Resets the builder instance
// 	 * @return A Builder singleton instance to get a family
// 	 */
// 	public reset(): Builder {
// 		this.allBits = ZERO_BITS
// 		this.oneBits = ZERO_BITS
// 		this.excludeBits = ZERO_BITS
// 		return this
// 	}

// 	/**
// 	 * @param componentTypes entities will have to contain all of the specified components.
// 	 * @return A Builder singleton instance to get a family
// 	 */
// 	public all(componentClasses: Array<Klass<any>>): Builder {
// 		this.allBits = ComponentType.getBitsFor(componentClasses)
// 		return this
// 	}

// 	/**
// 	 * @param componentTypes entities will have to contain at least one of the specified components.
// 	 * @return A Builder singleton instance to get a family
// 	 */
// 	public one(componentClasses: Array<Klass<any>>): Builder {
// 		this.oneBits = ComponentType.getBitsFor(componentClasses)
// 		return this
// 	}

// 	/**
// 	 * @param componentTypes entities cannot contain any of the specified components.
// 	 * @return A Builder singleton instance to get a family
// 	 */
// 	public exclude(componentClasses: Array<Klass<any>>): Builder {
// 		this.excludeBits = ComponentType.getBitsFor(componentClasses)
// 		return this
// 	}

// 	/** @return A family for the configured component types */
// 	// public get(): Family {
// 	// 	String hash = getFamilyHash(allBits, one, exclude);
// 	// 	Family family = families.get(hash, null);
// 	// 	if (family == null) {
// 	// 		family = new Family(allBits, one, exclude);
// 	// 		families.put(hash, family);
// 	// 	}
// 	// 	return family;
// 	// }
// }
