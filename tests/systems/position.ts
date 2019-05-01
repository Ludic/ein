import Component from '../../src/Component'
import ComponentType from '../../src/ComponentType'
import ComponentMapper from '../../src/ComponentMapper'
import Family from '../../src/Family'
import Entity from '../../src/Entity'
import System from '../../src/System'
import Engine from '../../src/Engine'

import PositionComponent from '../components/position'

export default class PositionSystem extends System {
  private pm: ComponentMapper<PositionComponent> = ComponentMapper.getFor(PositionComponent)

  public entities: Entity[]
  public components = [PositionComponent]
  public family: Family

  constructor(){
    super()
    this.family = Family.all([PositionComponent]).get()
    // console.log("this.family: ", this.family)
  }

  public addedToEngine(engine: Engine): void {
    // console.log(this.family)
    this.entities = engine.getEntitiesFor(this.family)
    this.engine = engine
  }

  public removedFromEngine(engine: Engine): void {
    this.entities = []
	  // console.log("MovementSystem removed from engine.")
  }

  public update(deltaTime: number): void {
    if(this.engine)  this.entities = this.engine.getEntitiesFor(this.family)
    this.entities.forEach((entity: Entity) => {

		  const p = this.pm.get(entity)
      
      if(p){
		    // p.x += m.velocityX * deltaTime
		    // p.y += m.velocityY * deltaTime
      }
    })
  }
}
