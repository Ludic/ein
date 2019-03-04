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
		for (let i=0; i < this.entityListeners.length; i++) {
			let entityListenerData: EntityListenerData = this.entityListeners[i]
			if (entityListenerData.listener == listener) {
				// Shift down bitmasks by one step
        for(let mask of this.entityListenerMasks.values()) {
				  for(let k = i, n = mask.length(); k < n; k++) {
						if (mask.get(k + 1)) {
							mask.set(k);
						} else {
							mask.clear(k)
						}
					}
				}
				this.entityListeners.splice(this.entityListeners.indexOf(entityListenerData), 1)
			}
		}
  }

  // TODO
  public updateFamilyMembership(entity: Entity): void {
    // // Find families that the entity was added to/removed from, and fill
		// // the bitmasks with corresponding listener bits.
		// Bits addListenerBits = bitsPool.obtain();
		// Bits removeListenerBits = bitsPool.obtain();

		// for (Family family : entityListenerMasks.keys()) {
		// 	final int familyIndex = family.getIndex();
		// 	final Bits entityFamilyBits = entity.getFamilyBits();

		// 	boolean belongsToFamily = entityFamilyBits.get(familyIndex);
		// 	boolean matches = family.matches(entity) && !entity.removing;

		// 	if (belongsToFamily != matches) {
		// 		final Bits listenersMask = entityListenerMasks.get(family);
		// 		final Array<Entity> familyEntities = families.get(family);
		// 		if (matches) {
		// 			addListenerBits.or(listenersMask);
		// 			familyEntities.add(entity);
		// 			entityFamilyBits.set(familyIndex);
		// 		} else {
		// 			removeListenerBits.or(listenersMask);
		// 			familyEntities.removeValue(entity, true);
		// 			entityFamilyBits.clear(familyIndex);
		// 		}
		// 	}
		// }

		// // Notify listeners; set bits match indices of listeners
		// notifying = true;
		// Object[] items = entityListeners.begin();

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
		const entitiesInFamily: Entity[] | undefined = this.familyToEntitesMap.get(family)
	  if(!entitiesInFamily) {
	    this.familyToEntitesMap.set(family, [])
	    this.entityListenerMasks.set(family, new Bits())
      const entities = this.familyToEntitesMap.get(family)
      this.entities.forEach((entity: Entity) => {
	  	  this.updateFamilyMembership(entity)
      })
	  }
    return entitiesInFamily ? entitiesInFamily : []
	}
}


export class EntityListenerData {
	public listener: EntityListener
	public priority: number
}
