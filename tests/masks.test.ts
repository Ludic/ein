import { describe, expect, it } from 'vitest'
import { MaskTable } from '@ludic/ein'

describe('mask table', () => {
  it('sets, clears and lists bits across words, including bit 31', () => {
    const t = new MaskTable(2)
    t.ensureBits(70)
    expect(t.words).toBe(3)
    for (const bit of [0, 31, 32, 63, 69]) t.set(1, bit)
    expect(t.bits(1)).toEqual([0, 31, 32, 63, 69])
    expect(t.has(1, 31)).toBe(true)
    expect(t.has(0, 31)).toBe(false)
    t.clear(1, 32)
    expect(t.bits(1)).toEqual([0, 31, 63, 69])
    t.reset(1)
    expect(t.bits(1)).toEqual([])
  })

  it('grows slots and words without losing data', () => {
    const t = new MaskTable(1)
    t.set(0, 3)
    t.ensureSlots(10)
    t.set(9, 5)
    expect(t.ensureBits(40)).toBe(true)
    expect(t.ensureBits(40)).toBe(false)
    t.set(9, 39)
    expect(t.bits(0)).toEqual([3])
    expect(t.bits(9)).toEqual([5, 39])
  })

  it('matches all, any and none', () => {
    const t = new MaskTable(4)
    t.ensureBits(40)
    t.set(0, 1)
    t.set(0, 31)
    t.set(0, 35)
    const all = t.build([1, 31])
    const none = t.build([2])
    const any = t.build([35])
    const empty = t.build([])
    expect(t.matches(0, all, empty, none, true)).toBe(true)
    expect(t.matches(0, all, any, none, false)).toBe(true)
    expect(t.matches(0, t.build([1, 2]), empty, empty, true)).toBe(false)
    expect(t.matches(0, empty, empty, t.build([35]), true)).toBe(false)
    expect(t.matches(0, empty, t.build([3, 4]), empty, false)).toBe(false)
    expect(t.matches(1, empty, empty, empty, true)).toBe(true)
  })
})
