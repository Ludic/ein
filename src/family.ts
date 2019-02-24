import { Component } from './component'
import { Entity, EntityListener } from './entity'

type Klass<T> = { new (...args: any[]): T }
/**
 * Represents a group of [[Component]]s. It is used to describe what [[Entity]] objects a [[System]] should
 * process. Example: {@code Family.all(PositionComponent.class, VelocityComponent.class).get()} Families can't be instantiated
 * directly but must be accessed via a builder ( start with {@code Family.all()}, {@code Family.one()} or {@code Family.exclude()}
 * ), this is to avoid duplicate families that describe the same components.
 */

export class Family {
  components: Component[]
  entities: Entity[]
  constructor(components: Component[] = [], entities: Entity[] = []){
    this.components = components
    this.entities = entities
  }
}

export class FamilyManager {
  // Family -> Entity[]
  familyToEntitesMap = new WeakMap
  // Component[] => Family
  componentsToFamilyMap = new WeakMap
  // Entity -> Family
  entityToFamilyMap = new WeakMap

  families: Family[] = []
  entities: Entity[]
  entityListeners: EntityListenerData[] = []

  constructor(entities: Entity[]){
    this.entities = entities
  }

  public getEntitiesFor(family: Family): Entity[] {
		return this.registerFamily(family)
  }

  public getOrCreateFamily(components: string[]): Family {
    console.log("getOrCreateFamily: ", components)
    let family = this.componentsToFamilyMap.get(components)
    console.log("getOrCreateFamily: ", family)
    if(family){
      return family
    } else {
      family = new Family(components)
      this.componentsToFamilyMap.set(components, family)
      this.families.push(family)
      return family
    }
  }

  public addEntityListener(listener: EntityListener, priority: number, family?: Family): void {
		family ? this.registerFamily(family) : void(0)

		let insertionIndex = 0
    this.entityListeners.forEach((e: EntityListenerData) => {
      e.priority <= priority ? insertionIndex++ : void(0)
    })

		let entityListenerData: EntityListenerData = new EntityListenerData()
    entityListenerData.listener = listener
		entityListenerData.priority = priority
		this.entityListeners.splice(insertionIndex, 0, entityListenerData)
	}

	public removeEntityListener(listener: EntityListener): void {
		// for (int i = 0; i < entityListeners.size; i++) {
		// 	EntityListenerData entityListenerData = entityListeners.get(i);
		// 	if (entityListenerData.listener == listener) {
		// 		// Shift down bitmasks by one step
		// 		for (Bits mask : entityListenerMasks.values()) {
		// 			for (int k = i, n = mask.length(); k < n; k++) {
		// 				if (mask.get(k + 1)) {
		// 					mask.set(k);
		// 				} else {
		// 					mask.clear(k);
		// 				}
		// 			}
		// 		}

		// 		entityListeners.removeIndex(i--);
		// 	}
		// }
  }

  public updateFamilyMembership(entity: Entity): void {
    // console.log("\n updateFamilyMembership: ", entity)
    const components = entity.getComponents().map((c: Component) => c.constructor)
    if(entity.getComponents().length){

      let currentFamily: Family = this.componentsToFamilyMap.get(components)
      let previousFamily = this.entityToFamilyMap.get(entity)

      // Entity changed Family
      if(previousFamily && currentFamily && previousFamily != currentFamily){
        this.entityListeners.forEach((listenerData: EntityListenerData) => {
          listenerData.listener.entityRemoved(entity)
        })
        this.entityListeners.forEach((listenerData: EntityListenerData) => {
          listenerData.listener.entityAdded(entity)
        })
      }

      // Entity doesn't have a Family yet
      if(!currentFamily){
        currentFamily = this.getOrCreateFamily(components.map(c => c.name))
        this.entityListeners.forEach((listenerData: EntityListenerData) => {
          listenerData.listener.entityAdded(entity)
        })
      }

      // console.log("currentFamily: ", currentFamily)
      // console.log("previousFamily: ", previousFamily)
    }

	  // try {
	  // 	for (int i = removeListenerBits.nextSetBit(0); i >= 0; i = removeListenerBits.nextSetBit(i + 1)) {
	  // 		((EntityListenerData)items[i]).listener.entityRemoved(entity);
	  // 	}

	  // 	for (int i = addListenerBits.nextSetBit(0); i >= 0; i = addListenerBits.nextSetBit(i + 1)) {
	  // 		((EntityListenerData)items[i]).listener.entityAdded(entity);
	  // 	}
	  // }
	  // finally {
	  // 	addListenerBits.clear();
	  // 	removeListenerBits.clear();
	  // 	bitsPool.free(addListenerBits);
	  // 	bitsPool.free(removeListenerBits);
	  // 	entityListeners.end();
	  // 	notifying = false;
	  // }
  }

  private registerFamily(family: Family): Entity[] {
		const entitiesInFamily: Entity[] = this.familyToEntitesMap.get(family)
	  if(entitiesInFamily) {
	    return entitiesInFamily
	  } else {
      this.entities.forEach((entity: Entity) => {
	  	  this.updateFamilyMembership(entity)
      })
      return this.familyToEntitesMap.get(family)
    }
	}
}


export class EntityListenerData {
	public listener: EntityListener
	public priority: number
}
