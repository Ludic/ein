import { assert } from 'chai'
import { Component, TransferableComponent, Entity, System, Engine } from '../src/'

class TestComponent extends TransferableComponent {
  constructor(value: number){
    super(value)
  }
}

const engine: Engine = new Engine()

describe('Basic', ()=>{

  it('should probably initialize', async()=>{
    assert.equal(!!engine, true)
  })

  it('', async()=>{
    assert.equal(!!engine, true)
  })

})
