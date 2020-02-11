import { Component } from "../src/Component"

let data: any = {
  x: 0,
  y: 0
}

let t = new Component(data)

console.log(t)

t.data = {
  x: 2,
  y: 3
}

console.log(t)
