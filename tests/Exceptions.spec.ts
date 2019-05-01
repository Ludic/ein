import { assert } from 'chai'
import { IllegalStateException } from '../src/exceptions'

describe('Exceptions', () => {
  it('should throw a custom exception', async () => {

    const test_message = "test"
    const test_name = "IllegalStateException"

    try {
      throw new IllegalStateException(test_message)
    } catch(e) {
      assert.equal(e.name, test_name)
      assert.equal(e.message, test_message)
      assert.equal(e instanceof IllegalStateException, true)
    }
  })
})
