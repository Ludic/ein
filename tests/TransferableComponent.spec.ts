import { assert } from 'chai'
import { TransferableComponent } from '../src/TransferableComponent'


class TestComponent extends TransferableComponent {
  constructor(value: number){
    super(value)
  }
}


describe('TransferableComponent', ()=>{
  it('should work', async()=>{
    assert.equal(1, 1)
  })
})
