// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array

export default class Bits {
  bits: Float64Array

  constructor(length?: number){
    if(length){
      this.bits = new Float64Array(length)
    } else {
      this.bits = new Float64Array()
    }
  }


  /** @param index the index of the bit to set
	 * @throws ArrayIndexOutOfBoundsException if index < 0 */
	public set(index: number): void {
		const word: number = index >>> 6
		this.checkCapacity(word)
		// this.bits[word] |= 1L << (index & 0x3F)
	}

  private checkCapacity(len: number): void {
		if (len >= this.bits.length) {
			const newBits: Float64Array = new Float64Array(len + 1)
			newBits.set(this.bits)
			this.bits = newBits
		}
	}

}
