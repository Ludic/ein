import Family from '../Family'
import Entity from '../Entity'
import System from '../System'
import Engine from '../Engine'

/**
 * A simple EntitySystem that iterates over each entity and calls processEntity() for each entity every time the System is
 * updated. This is really just a convenience class as most systems iterate over a list of entities.
 */
export default abstract class IteratingSystem extends System {
  private family: Family
  private entities: Entity[]

  constructor(family: Family, priority: number = 0){
    super(priority)
    this.family = family
  }

  public addedToEngine(engine: Engine): void {
    this.entities = engine.getEntitiesFor(this.family)
    this.engine = engine
  }

  public removedFromEngine(): void {
    this.entities = []
  }

  public update(deltaTime: number): void {
    if(this.engine)  this.entities = this.engine.getEntitiesFor(this.family)
    this.entities.forEach((entity: Entity) => {
      this.processEntity(entity, deltaTime)
    })
  }

  protected abstract processEntity(entity: Entity, deltaTime: number): void
}
