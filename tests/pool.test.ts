import { describe, expect, it } from 'vitest'
import { Pool } from '@ludic/ein'

describe('pool', () => {
  it('hands out objects and takes them back', () => {
    let n = 0
    const pool = new Pool(() => ({ n: n++ }), 2)
    expect(pool.size).toBe(2)
    expect(pool.available).toBe(2)
    const a = pool.acquire()
    const b = pool.acquire()
    expect(pool.available).toBe(0)
    const c = pool.acquire()
    expect(pool.size).toBe(3)
    pool.release(a)
    pool.release(b)
    pool.release(c)
    expect(pool.available).toBe(3)
    expect(pool.acquire()).toBe(c)
    pool.reserve(2)
    expect(pool.size).toBe(5)
  })
})
