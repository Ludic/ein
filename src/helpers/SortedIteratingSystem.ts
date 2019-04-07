import Family from '../Family'
import Entity from '../Entity'
import System from '../System'
import Engine from '../Engine'

/**
 * A simple EntitySystem that processes each entity of a given family in the order specified by a comparator and calls
 * processEntity() for each entity every time the EntitySystem is updated. This is really just a convenience class as rendering
 * systems tend to iterate over a list of entities in a sorted manner. Adding entities will cause the entity list to be resorted.
 * Call forceSort() if you changed your sorting criteria.
 * @author Santo Pfingsten
 */
export default abstract class SortedIteratingSystem extends System {
  private family: Family
  private entities: Entity[]
	private comparator: (a: Entity, b: Entity) => number

  constructor(family: Family, comparator: (a: Entity, b: Entity) => number, priority: number = 0){
    super(priority)
    this.family = family
    this.comparator = comparator
  }

  public addedToEngine(engine: Engine): void {
    this.entities = engine.getEntitiesFor(this.family)
    this.engine = engine
  }

  public removedFromEngine(): void {
    this.entities = []
  }

  public update(deltaTime: number): void {
    if(this.engine){
      // If entities are the same, don't run sort
      if(this.entities == this.engine.getEntitiesFor(this.family)){
        this.entities.forEach((entity: Entity) => {
          this.proccessEntity(entity, deltaTime)
        })
      } else {
        this.entities = this.engine.getEntitiesFor(this.family).sort(this.comparator)
        this.entities.forEach((entity: Entity) => {
          this.proccessEntity(entity, deltaTime)
        })
      }
    }
  }

  protected abstract proccessEntity(entity: Entity, deltaTime: number): void
}
