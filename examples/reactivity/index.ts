import { lambda } from '../../src/reactivity/lambda'
import { reactive } from '../../src/reactivity/reactive'

console.log('reactivity example')

const o = reactive({
  count: 1,
})

document.querySelector('#button').addEventListener('click', ()=>{
  o.count++
})

const header = document.querySelector('#header')

const l = lambda(()=>{
  header.textContent = `count: ${o.count}`
})