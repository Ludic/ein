import { reactive, effect, System, Entity, Query, Engine, Component } from '../../dist/index.es.js'
import { hot } from 'vite/hmr'

// this code will be stripped out when building
// @ts-ignore
if (__DEV__) {
  console.log('hmr enabled')
  hot.accept('../../dist/index.es.js', (newFoo) => {
    // the callback receives the updated './foo.js' module
    console.log('got new index')
    // newFoo.foo()
  })
  
  // Can also accept an array of dep modules:
  // hot.accept(['./foo.js', './bar.js'], ([newFooModule, newBarModule]) => {
  //   // the callback receives the updated mdoules in an Array
  //   console.log('got new index')
  // })
}

console.log('reactivity example')


class MovementSystem extends System {
  angle: number
  circles: Query

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
  }

  onAdded(engine: Engine){
    this.circles = engine.createQuery({
      name: 'circle'
    })
  }

  execute(delta: number, time: number): void {
    this.circles.entities.forEach((entity: Entity)=>{
      let pos: PositionComponent = entity.getComponent(PositionComponent)
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
    this.circles = engine.createQuery({name: 'circle'})
  }

  execute(delta: number, time: number): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    this.ctx.fillStyle = "steelblue"
    this.circles.entities.forEach((entity: Entity)=>{
      const pos: PositionComponent = entity.getComponent(PositionComponent)!
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

engine
  .createEntity("circle")
  .addComponent(PositionComponent, {x: 50, y: 50, angle: 0})

engine
.createEntity("circle")
.addComponent(PositionComponent, {x: 50, y: 50, angle: 180})


let start: any = null
function update(timestamp: number){
  if(!start) start = timestamp
  engine.execute(timestamp-start, timestamp)
  requestAnimationFrame(update)
}

requestAnimationFrame(update)