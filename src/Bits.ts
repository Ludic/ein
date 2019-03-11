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


  /** Returns the index of the first bit that is set to true that occurs on or after the specified starting index. If no such bit
	 * exists then -1 is returned. */
	public nextSetBit(fromIndex: number): number {
		let bits = this.bits;
		let word = fromIndex >>> 6
		let bitsLength = bits.length
		if (word >= bitsLength) return -1
		let bitsAtWord = bits[word]
		if (bitsAtWord != 0) {
			for (let i = fromIndex & 0x3f; i < 64; i++) {
				if ((bitsAtWord & (1 << (i & 0x3F))) != 0) {
					return (word << 6) + i;
				}
			}
		}
		for (word++; word < bitsLength; word++) {
			if (word != 0) {
				bitsAtWord = bits[word];
				if (bitsAtWord != 0) {
					for (let i = 0; i < 64; i++) {
						if ((bitsAtWord & (1 << (i & 0x3F))) != 0) {
							return (word << 6) + i;
						}
					}
				}
			}
		}
		return -1;
  }

  /** Performs a logical <b>AND</b> of this target bit set with the argument bit set. This bit set is modified so that each bit in
	 * it has the value true if and only if it both initially had the value true and the corresponding bit in the bit set argument
	 * also had the value true.
	 * @param other a bit set */
	public and(other: Bits): void {
		let commonWords: number = Math.min(this.bits.length, other.bits.length);
		for (let i = 0; commonWords > i; i++) {
			this.bits[i] &= other.bits[i];
		}

		if (this.bits.length > commonWords) {
			for (let i = commonWords, s = this.bits.length; s > i; i++) {
				this.bits[i] = 0
			}
		}
  }

  /** Clears all of the bits in this bit set whose corresponding bit is set in the specified bit set.
	 *
	 * @param other a bit set */
	public andNot(other: Bits): void {
		for (let i = 0, j = this.bits.length, k = other.bits.length; i < j && i < k; i++) {
			this.bits[i] &= ~other.bits[i]
		}
  }

  /** Performs a logical <b>OR</b> of this bit set with the bit set argument. This bit set is modified so that a bit in it has the
	 * value true if and only if it either already had the value true or the corresponding bit in the bit set argument has the
	 * value true.
	 * @param other a bit set */
	public or(other: Bits): void {
		let commonWords: number = Math.min(this.bits.length, other.bits.length);
		for (let i=0; commonWords > i; i++) {
			this.bits[i] |= other.bits[i];
		}

		if(commonWords < other.bits.length) {
			this.checkCapacity(other.bits.length);
			for (let  i = commonWords, s = other.bits.length; s > i; i++) {
				this.bits[i] = other.bits[i];
			}
		}
  }

	/** Performs a logical <b>XOR</b> of this bit set with the bit set argument. This bit set is modified so that a bit in it has
	 * the value true if and only if one of the following statements holds:
	 * <ul>
	 * <li>The bit initially has the value true, and the corresponding bit in the argument has the value false.</li>
	 * <li>The bit initially has the value false, and the corresponding bit in the argument has the value true.</li>
	 * </ul>
	 * @param other */
	public xor(other: Bits): void {
		let commonWords = Math.min(this.bits.length, other.bits.length);

		for (let i = 0; commonWords > i; i++) {
			this.bits[i] ^= other.bits[i];
		}

		if (commonWords < other.bits.length) {
			this.checkCapacity(other.bits.length);
			for(let i = commonWords, s = other.bits.length; s > i; i++) {
				this.bits[i] = other.bits[i];
			}
		}
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

  public hashCode(): number {
		const word: number = this.length() >>> 6
		let hash: number = 0
		for(let i = 0; word >= i; i++) {
			hash = 127 * hash + (this.bits[i] ^ (this.bits[i] >>> 32))
		}
		return hash;
  }

  public equals(obj: any): boolean {
		if(this == obj)
			return true
		if(obj == null)
			return false

		let other: Bits = <Bits>obj
		let otherBits = other.bits

		let commonWords = Math.min(this.bits.length, otherBits.length);
		for(let i = 0; commonWords > i; i++) {
			if(this.bits[i] != otherBits[i])
				return false;
		}

		if (this.bits.length == otherBits.length)
			return true;

		return this.length() == other.length()
  }
}
