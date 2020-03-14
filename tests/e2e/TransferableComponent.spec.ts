import { assert } from 'chai'
import { TransferableComponent } from '../../src/TransferableComponent'

class TestComponent extends TransferableComponent {
  constructor(value: number){
    super(value)
  }
}

describe('TransferableComponent', ()=>{

  it('should init', async()=>{
    const t: TestComponent = new TestComponent(5)
    assert.equal(!!t, true)
  })

  it('should lazy encode / decode', async()=>{
    const t: TestComponent = new TestComponent(5)

    assert.equal(t.data, 5)
    assert.equal(t.lastModified, "data")
    assert.equal(t.modified, false)

    // t._transferable_data should not be encoded until read
    assert.equal(!!t._transferable_data, false)

    // should now encode
    const a = t.transferable_data
    assert.equal(!!t._transferable_data, true)

    // should not be modifed, just encoded
    assert.equal(t.modified, false)

    // lastModified should be null, as both data and transferable_data are now equal
    assert.equal(t.lastModified, null)
  })
})
