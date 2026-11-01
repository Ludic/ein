import { Component, Engine, System, type Query } from '@ludic/ein'

class Position extends Component {
  x = 0
  y = 0
}
class Orbit extends Component {
  angle = 0
  radius = 100
  /** radians per second */
  speed = 1
}
class Style extends Component {
  color = 'steelblue'
  size = 8
}

class MovementSystem extends System {
  orbiting!: Query<Position | Orbit>

  override onAdded(): void {
    // Queries are created here, not in field initializers: `this.engine` is set just before onAdded().
    this.orbiting = this.query({ all: [Position, Orbit] })
  }

  override update(delta: number): void {
    for (const entity of this.orbiting) {
      const orbit = entity.get(Orbit)
      const position = entity.get(Position)
      orbit.angle += (orbit.speed * delta) / 1000
      position.x = 200 + Math.cos(orbit.angle) * orbit.radius
      position.y = 200 + Math.sin(orbit.angle) * orbit.radius
    }
  }
}

class RenderSystem extends System {
  ctx!: CanvasRenderingContext2D
  drawables!: Query<Position | Style>

  override onAdded(): void {
    const canvas = document.querySelector<HTMLCanvasElement>('#canvas')!
    this.ctx = canvas.getContext('2d')!
    this.drawables = this.query({ all: [Position, Style] })
  }

  override update(): void {
    const { ctx } = this
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)
    for (const entity of this.drawables) {
      const position = entity.get(Position)
      const style = entity.get(Style)
      ctx.fillStyle = style.color
      ctx.beginPath()
      ctx.arc(position.x, position.y, style.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

const engine = new Engine()
engine.addSystem(MovementSystem)
engine.addSystem(RenderSystem)

for (let i = 0; i < 12; i++) {
  engine
    .createEntity(`circle-${i}`)
    .add(Position)
    .add(Orbit, { angle: (i / 12) * Math.PI * 2, radius: 60 + i * 9, speed: 0.5 + i * 0.15 })
    .add(Style, { color: `hsl(${i * 30} 70% 55%)`, size: 6 + (i % 3) * 3 })
}

let last = 0
function frame(time: number): void {
  engine.update(time - last, time)
  last = time
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
