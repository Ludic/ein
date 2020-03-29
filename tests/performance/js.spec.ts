import { assert } from 'chai'
import { Component, TransferableComponent, Entity, EntityManager, System, Engine } from '../../src/'


// describe('JS Performance', ()=>{

//   it('Map.get() + Map.set() vs Array.push()', async()=>{
//     const total_elements: number = 1000000

//     // Array test
//     const array_time_start = new Date().getTime()
//     let a: any[] = []
//     for(let i=0;i<total_elements;i++){
//       a.push({i})
//     }
//     const array_time_total = new Date().getTime() - array_time_start

//     // Map test
//     const map_time_start = new Date().getTime()
//     let m: Map<number, any> = new Map()
//     for(let i=0;i<total_elements;i++){
//       m.set(1, m.get(1)+{i})
//     }
//     const map_time_total = new Date().getTime() - map_time_start
//     assert.isBelow(array_time_total,  map_time_total)
//   })


//   it('JSON.stringify()', async()=>{
//     const total_elements: number = 1000000
//     let data: any[] = []
//     for(let i=0;i<total_elements;i++){
//       data.push({i})
//     }

//     const start = new Date().getTime()
//     const s: string = JSON.stringify(data)
//     const total = new Date().getTime() - start

//     console.log("time: ", total)
//     assert.isAbove(total,  10)
//   })

//   it('JSON.parse()', async()=>{
//     const total_elements: number = 1000000
//     let data: any[] = []
//     for(let i=0;i<total_elements;i++){
//       data.push({i})
//     }

//     const s: string = JSON.stringify(data)
//     const start = new Date().getTime()
//     const p: any = JSON.parse(s)
//     const total = new Date().getTime() - start

//     console.log("time: ", total)
//     assert.isAbove(total,  10)
//   })



// })
