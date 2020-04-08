import { Component, Engine } from '../../src/'
import { MovementSystem } from './MovementSystem'
import { RenderSystem } from './RenderSystem'


let state: string = "stop"
let total_entities: number = 500

document.getElementById("start")!.onclick = ()=>{ state = "start"; requestAnimationFrame(update) }
document.getElementById("stop")!.onclick = ()=>{ state = "stop" }
document.getElementById("step")!.onclick = ()=>{ state = "step";  requestAnimationFrame(update) }

class PositionComponent extends Component {}

const engine: Engine = new Engine()
engine.addSystem(MovementSystem)
engine.addSystem(RenderSystem)

for(let i=0; i<total_entities; i++){
  engine
    .createEntity("circle")
    .addComponent(PositionComponent, {x: 50, y: 50, angle: getRandomInt(0, 360)})
}


let last: number = 0
let frame_start: number = 0
let frame_end: number = 0

async function update(timestamp: number){
  console.log("update() start")
  frame_start = timestamp
  await engine.execute(timestamp-last, timestamp)
  last = timestamp

  frame_end = performance.now()


  // if(frame_end - frame_start > 16){
  //   console.log(frame_end - frame_start)
  // }
  console.log("update() end")
  if(state == "start"){
    requestAnimationFrame(update)
  }
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
