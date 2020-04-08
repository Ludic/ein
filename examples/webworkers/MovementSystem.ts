import { Component, TransferableComponent, Entity, System, Query, Engine, Utils } from '../../src/'

export class MovementSystem extends System {
  entities: Entity[]
  entity_query: Query
  angle: number
  data: any
  worker_execute: (entities: any[], dt: number)=>Promise<Entity[]>

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
    this.entity_query = {entity_name: "circle" }

    this.worker_execute = Utils.greenlet((entities: Entity[], dt: number): Promise<Entity[]> => {
      return new Promise((resolve)=>{
        const start: number = performance.now()

        entities.forEach((entity: Entity)=>{
          let pos: any = entity.components.find((component: Component)=>component.class_name=="PositionComponent")

          pos.data.x = 150 - Math.cos((Math.PI / 180) * pos.data.angle) * 100
          pos.data.y = 150 + Math.sin((Math.PI / 180) * pos.data.angle) * 100
          pos.data.angle -= dt/10
        })
        console.log("movement: ", performance.now() - start)
        return resolve(entities)
      })
    })
  }

  async execute(dt: number, time: number): Promise<void> {
    const start: number = performance.now()
    // let entities: Entity[] = await this.worker_execute(this.entities, dt)
    // this.engine.entity_manager.syncEntities(entities)


    this.worker_execute(this.entities, dt).then((entities: Entity[])=>{

      this.engine.entity_manager.syncEntities(entities)

    })
  }

  onAdded(engine: Engine): void {
    this.engine = engine
    this.entities = this.engine.entitiesForQuery(this.entity_query)
  }
}
