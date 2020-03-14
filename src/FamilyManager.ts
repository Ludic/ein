import { Component, Entity, Family, Engine } from './'

export class FamilyManager {
  engine: Engine
  families: Family[]

  family_to_entities: Map<Family, Entity[]>

  constructor(engine: Engine){
    this.engine = engine
    this.families = []
  }

  onEntityAdded(entity: Entity): void {

  }

  onEntityRemoved(entity: Entity): void {

  }

  updateFamilyMembership(): void {

  }

  onComponentAdded(component: Component): void {

  }


}
