import { reactive, effect, System, Entity, Query, Engine, Component, ComponentInstance } from '../../dist/index.js'
console.log("basic example")


class MovementSystem extends System {
  angle: number
  circles: Query

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
  }

  onAdded(engine: Engine){
    this.circles = engine.createQuery({
      all: [PositionComponent]
    })
  }

  update(delta: number, time: number): void {
    this.circles.entities.forEach((entity: Entity)=>{
      let pos: ComponentInstance<PositionComponent> = entity.getComponent(PositionComponent)
      pos.x = 150 - Math.cos((Math.PI / 180) * pos.angle) * 100
      pos.y = 150 + Math.sin((Math.PI / 180) * pos.angle) * 100
      pos.angle -= 2
    })
  }
}

class RenderSystem extends System {
  entities: Entity[] = []
  ctx: CanvasRenderingContext2D
  circles: Query

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
  }

  onAdded(engine: Engine): void {
    let canvas: any = document.getElementById('canvas')
    this.ctx = canvas.getContext('2d')
    this.circles = engine.createQuery({all: [PositionComponent]})
  }

  update(delta: number, time: number): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "steelblue"
    this.circles.entities.forEach((entity: Entity)=>{
      const pos: ComponentInstance<PositionComponent> = entity.getComponent(PositionComponent)!
      this.ctx.save()
      this.ctx.beginPath();
      this.ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2, true)
      this.ctx.fill()
      this.ctx.restore()
    })
  }
}

class PositionComponent extends Component {
  x: number
  y: number
  angle: number
}

const engine: Engine = new Engine()
engine.addSystem(MovementSystem)
engine.addSystem(RenderSystem)

engine.registerComponent(PositionComponent)

engine
  .createEntity("circle")
  .addComponent(PositionComponent, {x: 50, y: 50, angle: 0})

engine
.createEntity("circle")
.addComponent(PositionComponent, {x: 50, y: 50, angle: 180})


let start: any = null
function update(timestamp: number){
  if(!start) start = timestamp
  engine.update(timestamp-start, timestamp)
  console.log("update")
  // engine.execute(timestamp-start, timestamp)
  requestAnimationFrame(update)
}

requestAnimationFrame(update)
