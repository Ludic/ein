import greenlet from 'greenlet'
import { System, Engine, Query, Entity, WorkerSystem } from '../../src'
import { PositionComponent, HealthComponent } from '../components'

export class MovementSystem extends WorkerSystem {
  enabled: boolean
  engine: Engine
  queries: any

  constructor(){
    const queries = {
      entities: {
        components: [PositionComponent],
        mandatory: true
      },
    }
    super(queries)

    this.worker_execute = greenlet(async(entities: any)=>{
      entities.forEach((entity: any) => {
        entity.components.PositionComponent.x += .1
        entity.components.PositionComponent.y += .1
      })
      return entities
    })
  }
}
