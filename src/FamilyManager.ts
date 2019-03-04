import Bits from './Bits'
import Component from './Component'
import Family from './Family'
import Entity from './Entity'
import EntityListener from './EntityListener'

interface Klass<T> { new(): T }

export default class FamilyManager {
  entities: Entity[]
  familyToEntitesMap: WeakMap<Family, Entity[]> = new WeakMap<Family, Entity[]>()
  entityListenerMasks: Map<Family, Bits> = new Map<Family, Bits>()
  // componentsToFamilyMap: WeakMap<Component[], Family>= new WeakMap<Component[], Family>()
  // entityToFamilyMap: WeakMap<Entity, Family> = new WeakMap<Entity, Family>()
  families: Family[] = []
  entityListeners: EntityListenerData[] = []

  constructor(entities: Entity[]){
    this.entities = entities
  }

  public getEntitiesFor(family: Family): Entity[] {
		return this.registerFamily(family)
  }

  public addEntityListener(listener: EntityListener, priority: number = 0, family?: Family): void {
    if(family) this.registerFamily(family)
		let insertionIndex: number = 0
		while(insertionIndex < this.entityListeners.length) {
			if(this.entityListeners[insertionIndex].priority <= priority) {
				insertionIndex++
			} else {
				break
			}
		}

    // TODO, Bits.length might not work
		// Shift up bitmasks by one step
    for(let mask of this.entityListenerMasks.values()) {
		  for(let k: number = mask.length(); k > insertionIndex; k--) {
		  	if (mask.get(k - 1)) {
		  		mask.set(k)
		  	} else {
		  		mask.clear(k)
		  	}
		  	}
		  mask.clear(insertionIndex)
    }

		if(family){
      let mask: Bits | undefined = this.entityListenerMasks.get(family)
      if(mask) mask.set(insertionIndex)
    }

		const entityListenerData: EntityListenerData = new EntityListenerData()
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

  }

  private registerFamily(family: Family): Entity[] {
		const entitiesInFamily: Entity[] | undefined = this.familyToEntitesMap.get(family)
	  if(entitiesInFamily) {
	    return entitiesInFamily
	  } else {
      this.entities.forEach((entity: Entity) => {
	  	  this.updateFamilyMembership(entity)
      })
      const entities = this.familyToEntitesMap.get(family)
      return entities ? entities : []
    }
	}
}


export class EntityListenerData {
	public listener: EntityListener
	public priority: number
}
