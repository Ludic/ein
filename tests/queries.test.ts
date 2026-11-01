import { describe, expect, it, vi } from 'vitest'
import { Engine, System } from '@ludic/ein'
import { Health, Position, Velocity, setup } from './helpers'

describe('queries', () => {
  it('applies membership on update, not immediately', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const e = engine.createEntity().add(Position)
    expect(q.size).toBe(0)
    expect(q.matches(e)).toBe(true)
    expect(engine.queries.pending).toBe(1)
    engine.update(0, 0)
    expect(q.size).toBe(1)
    expect(q.has(e)).toBe(true)
    expect(q.first).toBe(e)
    expect(engine.queries.pending).toBe(0)
  })

  it('matches all / any / none', () => {
    const engine = setup()
    const all = engine.createQuery({ all: [Position, Velocity] })
    const any = engine.createQuery({ any: [Position, Health] })
    const none = engine.createQuery({ all: [Position], none: [Health] })
    const everything = engine.createQuery({})
    const a = engine.createEntity().add(Position).add(Velocity)
    const b = engine.createEntity().add(Position).add(Health)
    const c = engine.createEntity().add(Velocity)
    const d = engine.createEntity()
    engine.update(0, 0)
    expect([...all]).toEqual([a])
    expect(new Set(any.entities)).toEqual(new Set([a, b]))
    expect([...none]).toEqual([a])
    expect(all.has(c)).toBe(false)
    expect(new Set(everything.entities)).toEqual(new Set([a, b, c, d]))
  })

  it('tracks added and removed per frame and fires listeners', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const added = vi.fn()
    const removed = vi.fn()
    const updated = vi.fn()
    q.on('added', added)
    q.on('removed', removed)
    q.on('updated', updated)

    const e = engine.createEntity().add(Position)
    engine.update(0, 0)
    expect(q.added).toEqual([e])
    expect(q.removed).toEqual([])
    expect(added).toHaveBeenCalledWith(e)
    expect(updated).toHaveBeenCalledTimes(1)

    engine.update(0, 0)
    expect(q.added).toEqual([])
    expect(updated).toHaveBeenCalledTimes(1)

    e.remove(Position)
    engine.update(0, 0)
    expect(q.removed).toEqual([e])
    expect(q.size).toBe(0)
    expect(removed).toHaveBeenCalledWith(e)
    expect(updated).toHaveBeenCalledTimes(2)
  })

  it('keeps diffs from a manual flush until the next frame has run', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const seen: number[] = []
    engine.addSystem(() => seen.push(q.added.length))

    const e = engine.createEntity().add(Position)
    engine.flush()
    expect(q.size).toBe(1)
    expect(q.added).toEqual([e])
    engine.update(0, 0)
    expect(seen).toEqual([1])
    expect(q.added).toEqual([e])
    engine.update(0, 0)
    expect(seen).toEqual([1, 0])
    expect(q.added).toEqual([])
  })

  it('removes entities in any position without breaking the index', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const es = Array.from({ length: 5 }, (_, i) => engine.createEntity(`${i}`).add(Position))
    engine.update(0, 0)
    es[1]!.remove(Position)
    es[3]!.destroy()
    engine.update(0, 0)
    expect(new Set(q.entities)).toEqual(new Set([es[0], es[2], es[4]]))
    for (const e of q) expect(q.has(e)).toBe(true)
    expect(q.has(es[1]!)).toBe(false)
    expect(q.has(es[3]!)).toBe(false)
    es[1]!.add(Position)
    engine.update(0, 0)
    expect(q.size).toBe(4)
    expect(q.entities.indexOf(es[1]!)).toBe(3)
  })

  it('drops destroyed entities after update and deactivates them immediately', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const e = engine.createEntity().add(Position)
    engine.update(0, 0)
    engine.destroyEntity(e)
    expect(e.alive).toBe(false)
    expect(q.size).toBe(1)
    engine.update(0, 0)
    expect(q.size).toBe(0)
  })

  it('lets removed listeners read the components of a destroyed entity', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    let seen: number | undefined
    q.on('removed', (e) => {
      seen = e.get(Position)?.x
    })
    const e = engine.createEntity().add(Position, { x: 7 })
    engine.update(0, 0)
    e.destroy()
    engine.update(0, 0)
    expect(seen).toBe(7)
  })

  it('disposes listeners and queries', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const added = vi.fn()
    const off = q.on('added', added)
    off()
    engine.createEntity().add(Position)
    engine.update(0, 0)
    expect(added).not.toHaveBeenCalled()
    expect(q.size).toBe(1)

    const disposed = vi.fn()
    engine.events.on('query:disposed', disposed)
    q.dispose()
    expect(q.isDisposed).toBe(true)
    expect(q.size).toBe(0)
    expect(engine.queries.size).toBe(0)
    expect(disposed).toHaveBeenCalledWith(q)
    engine.createEntity().add(Position)
    engine.update(0, 0)
    expect(q.size).toBe(0)
  })

  it('created after entities exist, matches them immediately', () => {
    const engine = setup()
    const a = engine.createEntity().add(Position)
    const b = engine.createEntity().add(Position).add(Velocity)
    engine.createEntity().add(Velocity)
    engine.update(0, 0)
    const q = engine.createQuery({ all: [Position] })
    expect(new Set(q.entities)).toEqual(new Set([a, b]))
    expect(new Set(q.added)).toEqual(new Set([a, b]))
    engine.update(0, 0)
    engine.update(0, 0)
    expect(q.added).toEqual([])
    expect(q.size).toBe(2)
    b.remove(Position)
    engine.update(0, 0)
    expect([...q]).toEqual([a])
  })

  it('populates queries created by a system added at runtime', () => {
    const engine = setup()
    const e = engine.createEntity().add(Position)
    engine.update(0, 0)
    let size = -1
    class Late extends System {
      override onAdded(): void {
        size = this.query({ all: [Position] }).size
      }
    }
    engine.addSystem(Late)
    expect(size).toBe(1)
    expect(e.alive).toBe(true)
  })

  describe('flush modes', () => {
    class Spawner extends System {
      override update(): void {
        this.engine.createEntity().add(Position)
      }
    }
    function counter(engine: Engine): () => number[] {
      const q = engine.createQuery({ all: [Position] })
      const sizes: number[] = []
      engine.addSystem(Spawner)
      engine.addSystem(() => sizes.push(q.size))
      return () => sizes
    }

    it('frame: later systems see changes next frame', () => {
      const engine = new Engine({ flush: 'frame' })
      const sizes = counter(engine)
      engine.update(0, 0)
      engine.update(0, 0)
      expect(sizes()).toEqual([0, 1])
    })

    it('system: later systems see changes in the same frame', () => {
      const engine = new Engine({ flush: 'system' })
      const sizes = counter(engine)
      engine.update(0, 0)
      engine.update(0, 0)
      expect(sizes()).toEqual([1, 2])
    })
  })
})
