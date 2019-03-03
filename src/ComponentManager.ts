import Entity from './Entity'

/**
 * Does things when you add / remove [[Components]] from [[Entities]]
 */
export default class ComponentManager {
  constructor(){}

  public add(entity: Entity): void {
		entity.notifyComponentAdded()
  }

  public remove(entity: Entity): void {
		entity.notifyComponentRemoved()
  }
}
