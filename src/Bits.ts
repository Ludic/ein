// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float64Array
// https://github.com/libgdx/libgdx/blob/master/gdx/src/com/badlogic/gdx/utils/Bits.java

export default class Bits {
  bits: Uint8Array

  constructor(length?: number){
    if(length){
      this.bits = new Uint8Array(length)
    } else {
      this.bits = new Uint8Array()
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
			const newBits: Uint8Array = new Uint8Array(len + 1)
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
    return this.bits.length

    // TODO
		// let bits: Uint8Array = this.bits
	  // for(let word: number = bits.length - 1; word >= 0; --word) {
		//   let bitsAtWord = bits[word]
		//   if (bitsAtWord != 0) {
		// 	  for (let bit = 63; bit >= 0; --bit) {
		// 		  if ((bitsAtWord & (1 << (bit & 0x3F))) != 0) {
		// 			  return (word << 6) + bit + 1
		// 		  }
		// 	  }
		//   }
	  // }
	  // return 0
  }


  /** @return true if this bitset contains no bits that are set to true */
	public isEmpty(): boolean{
		let bits = this.bits
		const length: number = bits.length
		for(let i=0; i<length; i++) {
			if (bits[i] != 0) {
				return false
			}
		}
		return true
  }

  /** Returns true if this bit set is a super set of the specified set, i.e. it has all bits set to true that are also set to true
	 * in the specified BitSet.
	 *
	 * @param other a bit set
	 * @return boolean indicating whether this bit set is a super set of the specified set */
	public containsAll(other: Bits): boolean {
		const bits = this.bits
		const otherBits = other.bits
	  const otherBitsLength: number = otherBits.length
	  const bitsLength: number = bits.length

	  for (let i=bitsLength; i<otherBitsLength; i++) {
		  if(otherBits[i] != 0){
			  return false
		  }
	  }
	  for (let i=Math.min(bitsLength, otherBitsLength) - 1; i>=0; i--) {
		  if ((bits[i] & otherBits[i]) != otherBits[i]) {
			  return false
		  }
	  }
	  return true
  }

  /** Returns true if the specified BitSet has any bits set to true that are also set to true in this BitSet.
	 *
	 * @param other a bit set
	 * @return boolean indicating whether this bit set intersects the specified bit set */
	public intersects(other: Bits): boolean {
		let bits = this.bits
	  let otherBits = other.bits
	  for (let i=Math.min(bits.length, otherBits.length) - 1; i >= 0; i--) {
		  if ((bits[i] & otherBits[i]) != 0) {
			  return true
		  }
	  }
	  return false
  }

}
