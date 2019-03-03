import Component from './Component'
import Entity from './Entity'

type Klass<T> = { new (...args: any[]): T }

/**
 * Represents a group of [[Component]]s. It is used to describe what [[Entity]] objects a [[System]] should
 * process. Example: {@code Family.all(PositionComponent.class, VelocityComponent.class).get()} Families can't be instantiated
 * directly but must be accessed via a builder ( start with {@code Family.all()}, {@code Family.one()} or {@code Family.exclude()}
 * ), this is to avoid duplicate families that describe the same components.
 */

export default class Family {
  components: Component[]
  entities: Entity[]
  constructor(components: Component[] = [], entities: Entity[] = []){
    this.components = components
    this.entities = entities
  }
}
