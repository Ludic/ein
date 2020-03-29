import { Component, TransferableComponent, Entity, System, Query, Engine } from '../../src/'

const encoder = new TextEncoder()
const decoder = new TextDecoder()


const engine: Engine = new Engine()


const total: number = 10
for(let i=0; i<total; i++){
  engine
    .createEntity("circle")
    .addComponent(TransferableComponent, {x: 50, y: 50, angle: 0}, true)
}

const entities: Entity[] = engine.entity_manager.entities
console.log("total ents: ", entities.length)



// entities.forEach((entity: Entity)=>{
//   entity.toTransferable()
// })


const start = performance.now()
const dstart = new Date().getTime()


const t_ents: any[] = []
entities.forEach((entity: Entity)=>{
  t_ents.push(entity.toTransferable())
})


// t_ents.forEach((entity: any)=>{

// })

console.log(performance.now() - start)
console.log(new Date().getTime() - dstart)

console.log(entities[0])
console.log(t_ents[0])
