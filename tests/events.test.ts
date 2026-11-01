import { describe, expect, it, vi } from 'vitest'
import { Emitter } from '@ludic/ein'

type Events = { ping: [n: number]; done: [] }

describe('emitter', () => {
  it('subscribes, emits and unsubscribes', () => {
    const em = new Emitter<Events>()
    const ping = vi.fn()
    const off = em.on('ping', ping)
    em.emit('ping', 1)
    expect(ping).toHaveBeenCalledWith(1)
    expect(em.listenerCount('ping')).toBe(1)
    off()
    em.emit('ping', 2)
    expect(ping).toHaveBeenCalledTimes(1)
    expect(em.listenerCount('ping')).toBe(0)
    em.emit('done')
  })

  it('supports once and unsubscribing during emit', () => {
    const em = new Emitter<Events>()
    const once = vi.fn()
    em.once('ping', once)
    const later = vi.fn()
    em.on('ping', () => em.off('ping', later))
    em.on('ping', later)
    em.emit('ping', 1)
    em.emit('ping', 2)
    expect(once).toHaveBeenCalledTimes(1)
    expect(later).toHaveBeenCalledTimes(1)
    em.clear()
    expect(em.listenerCount('ping')).toBe(0)
  })
})
