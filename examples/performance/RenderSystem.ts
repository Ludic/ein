import { System, Entity, Query, Engine, Component } from '../../src';

const circle_query: Query = {
  entity_name: "circle"
}
const canvas_query: Query = {
  entity_name: "canvas"
}

class PositionComponent extends Component {
  x: number
  y: number
  angle: number
}

export class CanvasComponent extends Component {
  canvas: OffscreenCanvas
}

export default class RenderSystem extends System {
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
  }

  execute(delta: number, time: number): void {
    const canvases = this.engine.entitiesForQuery(canvas_query)
    const ctx = canvases[0].class_to_component[CanvasComponent.name].data.canvas.getContext('2d')

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = "steelblue"
    this.entities.forEach((entity: Entity)=>{
      const pos: any = entity.class_to_component[PositionComponent.name]
      ctx.save()
      ctx.beginPath();
      ctx.arc(pos.data.x, pos.data.y, 10, 0, Math.PI * 2, true)
      ctx.fill()
      ctx.restore()
    })
  }
}
