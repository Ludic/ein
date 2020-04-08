import { Component, Entity, System, Query, Engine, Utils } from '../../src/'

export class RenderSystem extends System {
  entities: Entity[]
  ctx: CanvasRenderingContext2D
  entity_query: Query

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
    this.entity_query = {entity_name: "circle"}
  }

  onAdded(engine: Engine): void {
    this.engine = engine
    this.entities = this.engine.entitiesForQuery(this.entity_query)
    let canvas: any = document.getElementById('canvas')
    this.ctx = canvas.getContext('2d')
  }

  execute(delta: number, time: number): void {
    const start: number = performance.now()
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "steelblue"
    this.ctx.save()
    this.entities.forEach((entity: Entity)=>{
      const pos: any = entity.class_to_component["PositionComponent"]

      this.ctx.beginPath();
      this.ctx.arc(pos.data.x, pos.data.y, 10, 0, Math.PI * 2, true)
      this.ctx.fill()

    })
    this.ctx.restore()
    console.log("render: ", performance.now() - start)
  }
}
