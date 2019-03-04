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

  /** @param index the index of the bit
	 * @return whether the bit is set
	 * @throws ArrayIndexOutOfBoundsException if index < 0 */
	public get(index: number): boolean {
		const word: number = index >>> 6
		if (word >= this.bits.length) return false
		return (this.bits[word] & (1 << (index & 0x3F))) != 0
  }

  /** @param index the index of the bit to set
	 * @throws ArrayIndexOutOfBoundsException if index < 0 */
	public set(index: number): void {
		const word: number = index >>> 6
		this.checkCapacity(word)
		this.bits[word] |= 1 << (index & 0x3F)
	}

  private checkCapacity(len: number): void {
		if (len >= this.bits.length) {
			const newBits: Float64Array = new Float64Array(len + 1)
			newBits.set(this.bits)
			this.bits = newBits
		}
	}

  /** @param index the index of the bit to clear
	 * @throws ArrayIndexOutOfBoundsException if index < 0 */
	public clear(index: number): void {
		const word: number = index >>> 6
		if (word >= this.bits.length) return
		this.bits[word] &= ~(1 << (index & 0x3F))
	}

  /** Returns the "logical size" of this bitset: the index of the highest set bit in the bitset plus one. Returns zero if the
	 * bitset contains no set bits.
	 *
	 * @return the logical size of this bitset */
	public length(): number {
		let bits: Float64Array = this.bits
	  for(let word: number = bits.length - 1; word >= 0; --word) {
		  let bitsAtWord = bits[word]
		  if (bitsAtWord != 0) {
			  for (let bit = 63; bit >= 0; --bit) {
				  if ((bitsAtWord & (1 << (bit & 0x3F))) != 0) {
					  return (word << 6) + bit + 1
				  }
			  }
		  }
	  }
	  return 0
  }

}
