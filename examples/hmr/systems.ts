import { System, type Query } from '@ludic/ein'
import { Position, Spin } from './components'

export class SpinSystem extends System {
  spinning!: Query<Position | Spin>

  override onAdded(): void {
    this.spinning = this.query({ all: [Position, Spin] })
  }

  override update(delta: number): void {
    for (const entity of this.spinning) {
      const spin = entity.get(Spin)
      spin.angle += (spin.speed * delta) / 1000
    }
  }
}

export class RenderSystem extends System {
  ctx!: CanvasRenderingContext2D
  drawables!: Query<Position | Spin>

  override onAdded(): void {
    this.ctx = document.querySelector<HTMLCanvasElement>('#canvas')!.getContext('2d')!
    this.drawables = this.query({ all: [Position, Spin] })
  }

  override update(): void {
    const { ctx } = this
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    ctx.strokeStyle = 'tomato' // try changing the colour while the page is running
    ctx.lineWidth = 4
    for (const entity of this.drawables) {
      const { x, y } = entity.get(Position)
      const { angle } = entity.get(Spin)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(angle) * 120, y + Math.sin(angle) * 120)
      ctx.stroke()
    }
  }
}
