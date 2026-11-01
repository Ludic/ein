const WORD_BITS = 32

/**
 * One bitmask per entity slot, stored contiguously as `words` 32-bit words per slot.
 * Grows in both directions: more slots as entities are created, more words as
 * component types are registered, so there is no limit on the number of components.
 */
export class MaskTable {
  words: number = 1
  private data: Uint32Array
  private capacity: number

  constructor(capacity: number = 1024) {
    this.capacity = Math.max(1, capacity)
    this.data = new Uint32Array(this.capacity)
  }

  /** Make room for `bits` distinct bits. Returns true when the word count changed. */
  ensureBits(bits: number): boolean {
    const words = Math.max(1, Math.ceil(bits / WORD_BITS))
    if (words <= this.words) return false
    const next = new Uint32Array(this.capacity * words)
    for (let slot = 0; slot < this.capacity; slot++) {
      for (let w = 0; w < this.words; w++)
        next[slot * words + w] = this.data[slot * this.words + w]!
    }
    this.data = next
    this.words = words
    return true
  }

  /** Make room for `count` slots. */
  ensureSlots(count: number): void {
    if (count <= this.capacity) return
    const capacity = Math.max(count, this.capacity * 2)
    const next = new Uint32Array(capacity * this.words)
    next.set(this.data)
    this.data = next
    this.capacity = capacity
  }

  set(slot: number, bit: number): void {
    this.data[slot * this.words + (bit >>> 5)]! |= 1 << (bit & 31)
  }

  clear(slot: number, bit: number): void {
    this.data[slot * this.words + (bit >>> 5)]! &= ~(1 << (bit & 31))
  }

  has(slot: number, bit: number): boolean {
    return (this.data[slot * this.words + (bit >>> 5)]! & (1 << (bit & 31))) !== 0
  }

  /** Clear every bit of a slot. */
  reset(slot: number): void {
    const base = slot * this.words
    for (let w = 0; w < this.words; w++) this.data[base + w] = 0
  }

  /** The indices of the bits set for a slot, ascending. */
  bits(slot: number): number[] {
    const out: number[] = []
    const base = slot * this.words
    for (let w = 0; w < this.words; w++) {
      let m = this.data[base + w]!
      while (m !== 0) {
        const lsb = m & -m
        out.push(w * WORD_BITS + (31 - Math.clz32(lsb)))
        m ^= lsb
      }
    }
    return out
  }

  /**
   * Test a slot against query masks: every `all` bit set, no `none` bit set and,
   * unless `anyEmpty`, at least one `any` bit set.
   */
  matches(
    slot: number,
    all: Uint32Array,
    any: Uint32Array,
    none: Uint32Array,
    anyEmpty: boolean,
  ): boolean {
    const base = slot * this.words
    let anyHit = anyEmpty
    for (let w = 0; w < this.words; w++) {
      const m = this.data[base + w]!
      const a = all[w]!
      if ((m & a) >>> 0 !== a) return false
      if ((m & none[w]!) !== 0) return false
      if (!anyHit && (m & any[w]!) !== 0) anyHit = true
    }
    return anyHit
  }

  /** Build a query mask from bit indices, sized to the current word count. */
  build(bits: readonly number[]): Uint32Array {
    const mask = new Uint32Array(this.words)
    for (const bit of bits) mask[bit >>> 5]! |= 1 << (bit & 31)
    return mask
  }
}
