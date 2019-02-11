import { Component } from './component'
import { Entity, EntityListener } from './entity'

/**
 * Represents a group of [[Component]]s. It is used to describe what [[Entity]] objects a [[System]] should
 * process. Example: {@code Family.all(PositionComponent.class, VelocityComponent.class).get()} Families can't be instantiated
 * directly but must be accessed via a builder ( start with {@code Family.all()}, {@code Family.one()} or {@code Family.exclude()}
 * ), this is to avoid duplicate families that describe the same components.
 */

export interface Family {
  id: number
  components: Component[]
}

interface FamilyEntityMap { [family: Family]: Entity[] }

export class FamilyManager {
  families: Family[] = []
  familyEntityMap: FamilyEntityMap = {}
  familyIndex: number = 0
  entities: Entity[]

  constructor(entities: Entity[]){
    this.entities = entities
  }

  public updateFamilyMembership(entity: Entity): void {

  }


  public addEntityListener(family: Family, priority: number, listener: EntityListener): void {
		// this.registerFamily(family)

		// int insertionIndex = 0;
		// while (insertionIndex < entityListeners.size) {
		// 	if (entityListeners.get(insertionIndex).priority <= priority) {
		// 		insertionIndex++;
		// 	} else {
		// 		break;
		// 	}
		// }

		// // Shift up bitmasks by one step
		// for (Bits mask : entityListenerMasks.values()) {
		// 	for (int k = mask.length(); k > insertionIndex; k--) {
		// 		if (mask.get(k - 1)) {
		// 			mask.set(k);
		// 		} else {
		// 			mask.clear(k);
		// 		}
		// 	}
		// 	mask.clear(insertionIndex);
		// }

		// entityListenerMasks.get(family).set(insertionIndex);

		// EntityListenerData entityListenerData = new EntityListenerData();
		// entityListenerData.listener = listener;
		// entityListenerData.priority = priority;
		// entityListeners.insert(insertionIndex, entityListenerData);
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

  private registerFamily(family: Family): Entity[] {
		// const entitiesInFamily: Entity[] = this.familyEntityMap[family]

	  // if (entitiesInFamily == null) {
		//   Array<Entity> familyEntities = new Array<Entity>(false, 16);
		//   entitiesInFamily = new ImmutableArray<Entity>(familyEntities);
		//   families.put(family, familyEntities);
		//   immutableFamilies.put(family, entitiesInFamily);
		//   entityListenerMasks.put(family, new Bits());

		//   for (Entity entity : entities){
		// 	  updateFamilyMembership(entity);
		//   }
	  // }

	  // return entitiesInFamily;
    return this.entities
	}
}
