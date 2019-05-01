import ComponentMapper from '../../src/ComponentMapper'
import Family from '../../src/Family'
import Entity from '../../src/Entity'
import System from '../../src/System'
import Engine from '../../src/Engine'

import PositionComponent from '../components/position'
import MovementComponent from '../components/movement'

export default class MovementSystem extends System {
  private pm: ComponentMapper<PositionComponent> = ComponentMapper.getFor(PositionComponent.constructor.prototype)
  private mm: ComponentMapper<MovementComponent> = ComponentMapper.getFor(MovementComponent.constructor.prototype)

  public entities: Entity[]
  public components = [PositionComponent, MovementComponent]
  public family: Family

  constructor(){
    super()
    this.family = Family.all([PositionComponent, MovementComponent]).get()
  }

  public addedToEngine(engine: Engine): void {
    this.entities = engine.getEntitiesFor(this.family)
    this.engine = engine
  }

  public removedFromEngine(engine: Engine): void {
    this.entities = []
  }

  public update(deltaTime: number): void {
    if(this.engine)  this.entities = this.engine.getEntitiesFor(this.family)

    this.entities.forEach((entity: Entity) => {

		  const p = this.pm.get(entity)
		  const m = this.mm.get(entity)

      if(p && m){
		    p.x += m.velocityX * deltaTime
		    p.y += m.velocityY * deltaTime
      }
    })
  }
}
