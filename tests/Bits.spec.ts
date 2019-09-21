import { assert } from 'chai'
import { Bits } from '../dist/cjs/Ein'

describe('Bits', () => {

  it('hashCode() and equals()', async () => {
    let b1: Bits = new Bits()
		let b2: Bits = new Bits()

		b1.set(1)
		b2.set(1)

		assert.equal(b1.hashCode(), b2.hashCode())
		assert.isTrue(b1.equals(b2))

		// temporarily setting/clearing a single bit causing
		// the backing array to grow
		b2.set(10)
		b2.clear(10)

		assert.equal(b1.hashCode(), b2.hashCode())
		assert.isTrue(b1.equals(b2))

		b1.set(810)
		b1.clear(810)

		assert.equal(b1.hashCode(), b2.hashCode())
    assert.isTrue(b1.equals(b2))

  })

  it('xor()', async () => {
    let b1: Bits = new Bits()
		let b2: Bits = new Bits()

		b2.set(200)

		// b1:s array should grow to accommodate b2
		b1.xor(b2)

		assert.isTrue(b1.get(200))

		b1.set(1024)
		b2.xor(b1)

    assert.isTrue(b2.get(1024))
  })

  it('or()', async () => {
    let b1: Bits = new Bits()
		let b2: Bits = new Bits()

		b2.set(200);

		// b1:s array should grow to accommodate b2
		b1.or(b2)

		assert.isTrue(b1.get(200))

		b1.set(1024)
		b2.or(b1)

    assert.isTrue(b2.get(1024))
  })

  it('and()', async () => {
    let b1: Bits = new Bits()
		let b2: Bits = new Bits()

	  b2.set(200)
	  // b1 should cancel b2:s bit
	  b2.and(b1)

	  assert.isFalse(b2.get(200))

	  b1.set(400)
	  b1.and(b2)

    assert.isFalse(b1.get(400))
  })

  it('nextSetBit()', async () => {
    let b1: Bits = new Bits()

	  b1.set(20)

	  assert.isTrue(b1.get(20))
    assert.equal(20, b1.nextSetBit())

    b1.set(10)

    assert.equal(10, b1.nextSetBit())
    assert.equal(20, b1.nextSetBit(15))

  })

})
