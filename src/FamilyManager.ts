import { Entity, Family, Engine } from './'

export class FamilyManager {
  engine: Engine
  families: Family[]

  constructor(engine: Engine){
    this.engine = engine
    this.families = []
  }

  onEntityAdded(entity: Entity): void {

  }

}
