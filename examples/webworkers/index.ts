import { Component, TransferableComponent, Entity, System, Query, Engine, Utils } from '../../src/'
console.log("webworker example")


const circle_query: Query = {
  entity_name: "circle"
}

class PositionComponent extends Component {}

class MovementSystem extends System {
  entities: Entity[]
  entity_query: Query
  angle: number
  data: any
  worker_execute: (entities: any[], dt: number)=>Promise<{}>

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
    this.entity_query = circle_query

    this.worker_execute = Utils.greenlet(async(entities: any[], dt: number)=>{
      // console.log("dt: ", dt)
      entities.forEach((entity: Entity)=>{
        let pos: any = entity.components.find((component: Component)=>component.class_name=="PositionComponent")

        pos.data.x = 150 - Math.cos((Math.PI / 180) * pos.data.angle) * 100
        pos.data.y = 150 + Math.sin((Math.PI / 180) * pos.data.angle) * 100
        pos.data.angle -= dt/10
      })

      return entities
    })
  }

  async execute(dt: number, time: number): Promise<void> {
    // this.entities.forEach((entity: Entity)=>{
    //   let pos: any = entity.getComponent(PositionComponent)!

    //   pos.data.x = 150 - Math.cos((Math.PI / 180) * pos.data.angle) * 100
    //   pos.data.y = 150 + Math.sin((Math.PI / 180) * pos.data.angle) * 100
    //   pos.data.angle -= dt / 10

    // })

    let res: any = await this.worker_execute(this.entities.map((entity: Entity)=>entity.toCloneable()), dt)
    console.log("res: ", res)
  }

  onAdded(engine: Engine): void {
    this.engine = engine
    this.entities = this.engine.entitiesForQuery(this.entity_query)
  }

}

class RenderSystem extends System {
  entities: Entity[]
  ctx: CanvasRenderingContext2D
  entity_query: Query

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
    this.entity_query = circle_query
  }

  onAdded(engine: Engine): void {
    this.engine = engine
    this.entities = this.engine.entitiesForQuery(this.entity_query)
    let canvas: any = document.getElementById('canvas')
    this.ctx = canvas.getContext('2d')
  }

  execute(delta: number, time: number): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "steelblue"
    this.entities.forEach((entity: Entity)=>{
      const pos: any = entity.getComponent(PositionComponent)!
      this.ctx.save()
      this.ctx.beginPath();
      this.ctx.arc(pos.data.x, pos.data.y, 10, 0, Math.PI * 2, true)
      this.ctx.fill()
      this.ctx.restore()
    })
  }
}



const engine: Engine = new Engine()
engine.addSystem(MovementSystem)
engine.addSystem(RenderSystem)
engine
  .createEntity("circle")
  .addComponent(PositionComponent, {x: 50, y: 50, angle: 0})

engine
  .createEntity("circle")
  .addComponent(PositionComponent, {x: 50, y: 50, angle: 180})


let last: number = 0
function update(timestamp: number){
  engine.execute(timestamp-last, timestamp)
  last = timestamp
  requestAnimationFrame(update)
}

requestAnimationFrame(update)
