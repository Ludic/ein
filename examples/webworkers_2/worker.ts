import { Engine, System, Entity, Query } from '../../src';
import RenderSystem, { CanvasComponent } from './RenderSystem';

let engine: Engine = new Engine()
let canvas: OffscreenCanvas

engine.addSystem(RenderSystem)

let last: number = 0
function update(timestamp: number){
  engine.execute(timestamp-last, timestamp)
  last = timestamp
  requestAnimationFrame(update)
}

self.addEventListener('message', function(event){
  if(event.data){
    if(event.data.op == 'init'){
      canvas = event.data.data.canvas
      engine.createEntity('canvas')
        .addComponent(CanvasComponent, {canvas})
      this.requestAnimationFrame(update)
    } else if(event.data.op == 'sync'){
      engine.entity_manager.syncEntities(event.data.data.entities)
      // const ents = event.data.data.entities

    }
  }
})
