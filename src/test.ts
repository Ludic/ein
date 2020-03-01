import { TransferableComponent } from './TransferableComponent'
import { Component } from './Component'

class TestComponent extends TransferableComponent {
  constructor(value: number){
    super(value)
  }
}


let t = new TestComponent(5)
