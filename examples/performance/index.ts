import { Component, TransferableComponent, Entity, System, Query, Engine, Utils } from '../../src/'
console.log("webworker 2 example")

// copied from ludic since ts doesn't have offscreen canvas types
declare global {
  interface HTMLCanvasElement {
    transferControlToOffscreen(): OffscreenCanvas;
  }

  interface OffscreenCanvasRenderingContext2D extends CanvasState, CanvasTransform, CanvasCompositing, CanvasImageSmoothing, CanvasFillStrokeStyles, CanvasShadowStyles, CanvasFilters, CanvasRect, CanvasDrawPath, CanvasUserInterface, CanvasText, CanvasDrawImage, CanvasImageData, CanvasPathDrawingStyles, CanvasTextDrawingStyles, CanvasPath {
    readonly canvas: OffscreenCanvas;
  }
  var OffscreenCanvasRenderingContext2D: {
    prototype: OffscreenCanvasRenderingContext2D;
    new(): OffscreenCanvasRenderingContext2D;
  }
  interface CanvasRenderingContext2DSettings {
    desynchronized?: boolean
  }
  interface OffscreenCanvas extends EventTarget {
    width: number;
    height: number;
    getContext(contextId: "2d", contextAttributes ? : CanvasRenderingContext2DSettings): OffscreenCanvasRenderingContext2D | null;
  }
  var OffscreenCanvas: {
    prototype: OffscreenCanvas;
    new(width: number, height: number): OffscreenCanvas;
  }
}

const circle_query: Query = {
  entity_name: "circle"
}

class PositionComponent extends Component {
  x: number
  y: number
  angle: number
}

class MovementSystem extends System {
  entities: Entity[]
  entity_query: Query
  angle: number
  data: any
  // worker_execute: (entities: any[], dt: number)=>Promise<Entity[]>

  constructor(priority: number = 0, enabled: boolean = true) {
    super(priority, enabled)
    this.entity_query = circle_query
  }

  execute(dt: number, time: number) {
    let entities: Entity[] = this.entities
    // this.engine.entity_manager.syncEntities(entities)


    entities.forEach((entity: Entity)=>{
      let pos: any = entity.components.find((component: Component)=>component.class_name=="PositionComponent")

      pos.data.x = 150 - Math.cos((Math.PI / 180) * pos.data.angle) * 100
      pos.data.y = 150 + Math.sin((Math.PI / 180) * pos.data.angle) * 100
      pos.data.angle -= dt/10
    })
  }

  onAdded(engine: Engine): void {
    this.engine = engine
    this.entities = this.engine.entitiesForQuery(this.entity_query)
  }
}



const engine: Engine = new Engine()
engine.addSystem(MovementSystem)
// engine.addSystem(RenderSystem)
engine
  .createEntity("circle")
  .addComponent(PositionComponent, {x: 50, y: 50, angle: 0})

for(let i=0; i<100; i++){
  engine
    .createEntity("circle")
    .addComponent(PositionComponent, {x: 50, y: 50, angle: 180})
}

const worker = new Worker('./worker.ts')

const canvas: HTMLCanvasElement = document.body.querySelector('#canvas')
const offscreenCanvas: OffscreenCanvas = canvas.transferControlToOffscreen()
worker.postMessage({op: 'init', data: {canvas: offscreenCanvas}}, [offscreenCanvas as unknown as Transferable])

function sync(){
  worker.postMessage({op: 'sync', data: {entities: engine.entity_manager.entities}})
}


let state: string = "stop"

document.getElementById("start")!.onclick = ()=>{ state = "start"; requestAnimationFrame(update) }
document.getElementById("stop")!.onclick = ()=>{ state = "stop" }
document.getElementById("step")!.onclick = ()=>{ state = "step";  requestAnimationFrame(update) }


let frame_start: number = 0
let frame_end: number = 0
let last: number = 0
let total_sync: number = 0
let times_synced: number = 0
async function update(timestamp: number){
  frame_start = timestamp
  await engine.execute(timestamp-last, timestamp)

  const start_sync = performance.now()
  sync()
  const end_sync =  performance.now()
  times_synced++
  total_sync += end_sync - start_sync
  console.log("avg sync(): ", total_sync / times_synced)

  last = timestamp

  frame_end = performance.now()


  if(state == "start"){
    requestAnimationFrame(update)
  }
}
