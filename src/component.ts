import { Entity } from './entity'

/**
 * Interface for all Components. A Component is intended as a data holder and provides data to be processed in an
 * [[System]]. But do as you wish.
 * [[System]]s have no state and [[Component]]s have no behavior!!!!!
 */
export class Component {}

/**
 * Does things when you add / remove [[Components]] from [[Entities]]
 */
export class ComponentManager {
  constructor(){}

  public add(entity: Entity): void {
		entity.notifyComponentAdded()
  }

  public remove(entity: Entity): void {
		entity.notifyComponentRemoved()
  }
}
