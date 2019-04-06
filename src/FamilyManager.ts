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
  notifying: boolean = false

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

  public updateFamilyMembership(entity: Entity): void {
    // Find families that the entity was added to/removed from, and fill
		// the bitmasks with corresponding listener bits.
		let addListenerBits: Bits =  new Bits()
		let removeListenerBits: Bits = new Bits()

    this.entityListenerMasks.forEach((bits: Bits, family: Family, map) => {
			const familyIndex: number = family.getIndex()
      const entityFamilyBits: Bits = entity.getFamilyBits()

			let belongsToFamily: boolean = entityFamilyBits.get(familyIndex)
			let matches: boolean = family.matches(entity) && !entity.removing

			if (belongsToFamily != matches) {
				const listenersMask = this.entityListenerMasks.get(family)
				const familyEntities = this.familyToEntitesMap.get(family)
				if(matches) {
          if(listenersMask) addListenerBits.or(listenersMask)
          if(familyEntities) familyEntities.push(entity)
					entityFamilyBits.set(familyIndex)
				} else {
          if(listenersMask) removeListenerBits.or(listenersMask)
					if(familyEntities){
            familyEntities.splice(familyEntities.indexOf(entity), 1)
            // TODO do i need this^
            this.familyToEntitesMap.set(family, familyEntities)
          }
					entityFamilyBits.clear(familyIndex)
				}
			}
    })

    this.notifying = true
		try {
			for (let i = removeListenerBits.nextSetBit(0); i >= 0; i = removeListenerBits.nextSetBit(i + 1)) {
				this.entityListeners[i].listener.entityRemoved(entity)
			}

			for (let i = addListenerBits.nextSetBit(0); i >= 0; i = addListenerBits.nextSetBit(i + 1)) {
        this.entityListeners[i].listener.entityAdded(entity)
			}
		}
    finally {
      this.notifying = false
    }
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
      this.families.push(family)
	  }

    return entitiesInFamily ? entitiesInFamily : []
	}
}


export class EntityListenerData {
	public listener: EntityListener
	public priority: number
}
