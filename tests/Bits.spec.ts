import { assert } from 'chai'
import Bits from '@lib/Bits'

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
		b2.set(420)
		// b2.clear(420)

		// assert.equal(b1.hashCode(), b2.hashCode())

    // TODO
    console.log("b1: ", b1)
    console.log("b2: ", b2)
		// assert.isTrue(b1.equals(b2))

		// b1.set(810);
		// b1.clear(810);

		// assertEquals(b1.hashCode(), b2.hashCode());
    // assertTrue(b1.equals(b2));

  })


})
