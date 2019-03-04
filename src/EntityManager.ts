import Entity from './Entity'
import EntityListener from './EntityListener'
import { IllegalStateException } from './exceptions'

// Manages the addition / removal of entity
export default class EntityManager {
	private listener: EntityListener
	private entities: Entity[] = []

	constructor(listener: EntityListener) {
		this.listener = listener
	}

	public addEntity(entity: Entity): void {
    if(this.entities.indexOf(entity) > -1){
      throw new IllegalStateException("Entity has already been added \n" + entity)
    }
		this.entities.push(entity)
		this.listener.entityAdded(entity)
	}

	public removeEntity(entity: Entity): void {
    const i = this.entities.indexOf(entity)
    if(i > -1){
		  this.entities.splice(i, 1)
      this.listener.entityRemoved(entity)
    }
	}

	public removeAllEntities(entities?: Entity[]): void {
    if(entities){
      while(entities.length){
        this.removeEntity(entities[0])
        entities.splice(0, 1)
      }
    } else {
      while(this.entities.length){
        this.removeEntity(this.entities[0])
      }
    }
	}

  public getEntities(): Entity[] {
    return this.entities
  }
}
