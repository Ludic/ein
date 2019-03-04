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
  private static families: Map<String, Family> = new Map<String, Family>()
	private static familyIndex: number = 0
	// private static readonly builder: Builder = new Builder()
	private static readonly zeroBits: Bits = new Bits()

	private readonly allBits: Bits
	private readonly one: Bits
	private readonly exclude: Bits
	private readonly index: number

	/** Private constructor, use static method Family.getFamilyFor() */
	private Family(allBits: Bits, any: Bits, exclude :Bits) {
		// this.allBits = allBits
		// this.one = any
		// this.exclude = exclude
		// this.index = familyIndex++
	}

	/** @return This family's unique index */
	public getIndex(): number {
		return this.index
	}

	// /** @return Whether the entity matches the family requirements or not */
	// public matches(entity: Entity): boolean {
	// 	const entityComponentBits: Bits = entity.getComponentBits()

	// 	if (!entityComponentBits.containsAll(this.allBits)) {
	// 		return false
	// 	}

	// 	if (!this.one.isEmpty() && !this.one.intersects(entityComponentBits)) {
	// 		return false
	// 	}

	// 	if (!this.exclude.isEmpty() && this.exclude.intersects(entityComponentBits)) {
	// 		return false
	// 	}

	// 	return true
	// }

	// /**
	//  * @param componentTypes entities will have to contain all of the specified components.
	//  * @return A Builder singleton instance to get a family
	//  */
	// public static readonly all(componentClasses: Array<Klass<any>>): Builder {
	// 	return this.builder.reset().all(componentClasses)
	// }

	// /**
	//  * @param componentTypes entities will have to contain at least one of the specified components.
	//  * @return A Builder singleton instance to get a family
	//  */
	// public static readonly one(componentClasses: Array<Klass<any>>): Builder {
	// 	return this.builder.reset().one(componentClasses)
	// }

	// /**
	//  * @param componentTypes entities cannot contain any of the specified components.
	//  * @return A Builder singleton instance to get a family
	//  */
	// public static readonly exclude(componentClasses: Array<Klass<any>>): Builder {
	// 	return this.builder.reset().exclude(componentClasses)
	// }


	// public hashCode(): number {
	// 	return this.index
	// }

	// public equals(family: Family): boolean {
	// 	return this == family
	// }

	// private static getFamilyHash(allBits: Bits, one: Bits, exclude: Bits): string {
	// 	let hash = ""
	// 	if (!this.allBits.isEmpty()) {
	// 		hash = hash + "{all:" + this.getBitsString(this.allBits) + "}"
	//   }
	// 	if (!this.one.isEmpty()) {
  //     hash = hash + "{one:" + this.getBitsString(this.one) + "}"
	// 	}
	// 	if (!this.exclude.isEmpty()) {
  //     hash = hash + "{exclude:" + this.getBitsString(this.exclude) + "}"
	// 	}
	// 	return stringBuilder.toString();
	// }

	// private static getBitsString(bits: Bits): string {
  //   let bitString = ""
	// 	const numBits: number = bits.length()
	// 	for (let i=0; i<numBits; ++i) {
  //     bitString += bits.get(i) ? "1" : "0"
	// 	}
	// 	return bitString
  // }
}


// export class Builder {
// 	// private allBits: Bits = zeroBits
// 	// private one: Bits = zeroBits
// 	// private exclude: Bits = zeroBits

// 	constructor(){

// 	}

// 	/**
// 	 * Resets the builder instance
// 	 * @return A Builder singleton instance to get a family
// 	 */
// 	public reset(): Builder {
// 		// this.allBits = zeroBits
// 		// this.one = zeroBits
// 		// this.exclude = zeroBits
// 		return this
// 	}

// 	/**
// 	 * @param componentTypes entities will have to contain all of the specified components.
// 	 * @return A Builder singleton instance to get a family
// 	 */
// 	public readonly all(componentClasses: Array<Klass<any>>): Builder {
// 		this.allBits = ComponentType.getBitsFor(componentClasses)
// 		return this
// 	}

// 	/**
// 	 * @param componentTypes entities will have to contain at least one of the specified components.
// 	 * @return A Builder singleton instance to get a family
// 	 */
// 	public readonly one(componentClasses: Array<Klass<any>>): Builder {
// 		this.one = ComponentType.getBitsFor(componentClasses)
// 		return this
// 	}

// 	/**
// 	 * @param componentTypes entities cannot contain any of the specified components.
// 	 * @return A Builder singleton instance to get a family
// 	 */
// 	public readonly exclude(componentClasses: Array<Klass<any>>): Builder {
// 		this.exclude = ComponentType.getBitsFor(componentClasses)
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
