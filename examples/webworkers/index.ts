import { Component, TransferableComponent, Entity, System, Query, Engine, Utils } from '../../src/'
console.log("webworker example")


const circle_query: Query = {
  entity_name: "circle"
}

class MovementSystem extends System {
  entities: Entity[]
  entity_query: Query
  angle: number
  data: any
  worker_execute: any
  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
    this.entity_query = circle_query

    this.worker_execute = Utils.greenlet(async(entities: any)=>{
      console.log("worker: ", entities)
    })

    this.data = new TransferableComponent({x: 5})

  }

  onAdded(engine: Engine): void {
    this.engine = engine
    this.entities = this.engine.entitiesForQuery(this.entity_query)
  }

  execute(delta: number, time: number): void {
    this.entities.forEach((entity: Entity)=>{
      let pos: any = entity.getComponent(PositionComponent)!
      pos.data.x = 150 - Math.cos((Math.PI / 180) * pos.data.angle) * 100
      pos.data.y = 150 + Math.sin((Math.PI / 180) * pos.data.angle) * 100
      pos.data.angle -= 2

      // console.log(pos.transferable_data)
    })

    // console.log("1: ", this.data.transferable_data)
    // this.worker_execute(this.data.transferable_data)
    // console.log("2: ", this.data)
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

class PositionComponent extends TransferableComponent {}

const engine: Engine = new Engine()
engine.addSystem(MovementSystem)
engine.addSystem(RenderSystem)
engine
  .createEntity("circle")
  .addComponent(PositionComponent, {x: 50, y: 50, angle: 0}, true)

engine
  .createEntity("circle")
  .addComponent(PositionComponent, {x: 50, y: 50, angle: 180}, true)


let start: any = null
function update(timestamp: number){
  if(!start) start = timestamp
  engine.execute(timestamp-start, timestamp)
  requestAnimationFrame(update)
}

requestAnimationFrame(update)
