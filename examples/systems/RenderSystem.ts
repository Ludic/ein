import { System, Engine, Entity } from '../../src'
import { PositionComponent, HealthComponent } from '../components'

export class RenderSystem extends System {
  enabled: boolean
  engine: Engine
  queries: any
  canvas: any
  ctx: any

  constructor(){
    const queries = {
      entities: {
        components: [PositionComponent],
        mandatory: true
      },
    }
    super(queries)
    this.canvas = document.getElementById("canvas")
    this.ctx = this.canvas.getContext("2d")
  }

  async execute(deltaTime: number){
    const entities: Entity[] = this.queries.entities.results

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.save()

    entities.forEach((enemy: Entity) => {
      let pos: any = enemy.getMutableComponent(PositionComponent)
      let size = 10

      this.ctx.save()
      this.ctx.fillStyle = "#FF6961"
      this.ctx.fillRect(pos.x, pos.y, size, size)
      this.ctx.restore()
    })

    this.ctx.restore()
  }
}
