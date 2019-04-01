import Component from '@lib/Component'
import ComponentMapper from '@lib/ComponentMapper'
import Family from '@lib/Family'
import Entity from '@lib/Entity'
import System from '@lib/System'
import Engine from '@lib/Engine'

import PositionComponent from '@tests/components/position'
import MovementComponent from '@tests/components/movement'

export default class MovementSystem extends System {
  private pm: ComponentMapper<PositionComponent> = ComponentMapper.getFor(PositionComponent.constructor.prototype)
  private mm: ComponentMapper<MovementComponent> = ComponentMapper.getFor(MovementComponent.constructor.prototype)

  public entities: Entity[]
  public components = [PositionComponent, MovementComponent]
  public family: Family

  constructor(){
    super()
    this.family = Family.all([PositionComponent, MovementComponent]).get()
    // console.log("this.family: ", this.family)
  }

  public addedToEngine(engine: Engine): void {
    // console.log(this.family)
    this.entities = engine.getEntitiesFor(this.family)
    this.engine = engine
	  console.log("MovementSystem added to engine.", this.entities)
  }

  public removedFromEngine(engine: Engine): void {
    this.entities = []
	  // console.log("MovementSystem removed from engine.")
  }

  public update(deltaTime: number): void {
    if(this.engine)  this.entities = this.engine.getEntitiesFor(this.family)
    console.log("update: ", this.entities)

    this.entities.forEach((entity: Entity) => {

		  const p: PositionComponent | null = this.pm.get(entity)
		  const m: MovementComponent | null = this.mm.get(entity)

      if(p && m){
		    p.x += m.velocityX * deltaTime
		    p.y += m.velocityY * deltaTime
      }
    })

	  console.log(this.entities.length + " Entities updated in MovementSystem.")
  }
}
