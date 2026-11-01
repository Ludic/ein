import { describe, expect, it, vi } from 'vitest'
import { Engine, FunctionSystem, Query, System } from '@ludic/ein'
import { Position, Velocity, setup } from './helpers'

describe('systems', () => {
  it('runs systems ordered by priority, then insertion order', () => {
    const engine = setup()
    const calls: string[] = []
    class A extends System {
      override update(): void {
        calls.push('a')
      }
    }
    class B extends System {
      override priority = -1
      override update(): void {
        calls.push('b')
      }
    }
    class C extends System {
      override update(): void {
        calls.push('c')
      }
    }
    engine.addSystem(A)
    engine.addSystem(B)
    engine.addSystem(C)
    engine.addSystem(() => calls.push('d'), { priority: -2 })
    engine.update(1, 1)
    expect(calls).toEqual(['d', 'b', 'a', 'c'])
    expect(engine.systems.list.map((s) => s.constructor)).toEqual([FunctionSystem, B, A, C])
  })

  it('passes delta and time, skips disabled systems and the disabled engine', () => {
    const engine = setup()
    const update = vi.fn()
    class S extends System {
      override update(delta: number, time: number): void {
        update(delta, time)
      }
    }
    const s = engine.addSystem(S)
    expect(s).toBeInstanceOf(S)
    engine.update(16, 32)
    expect(update).toHaveBeenCalledWith(16, 32)
    s.enabled = false
    engine.update(16, 48)
    expect(update).toHaveBeenCalledTimes(1)
    s.enabled = true
    engine.enabled = false
    engine.update(16, 64)
    expect(update).toHaveBeenCalledTimes(1)
  })

  it('accepts instances and options, and rejects duplicates', () => {
    const engine = setup()
    class S extends System {}
    const s = new S()
    expect(engine.addSystem(s, { priority: 3, enabled: false })).toBe(s)
    expect(s.priority).toBe(3)
    expect(s.enabled).toBe(false)
    expect(s.engine).toBe(engine)
    expect(() => engine.addSystem(s)).toThrow()
    expect(engine.systems.get(S)).toBe(s)
    expect(engine.systems.has(s)).toBe(true)
    expect([...engine.systems]).toEqual([s])
  })

  it('calls lifecycle hooks and disposes resources on removal', () => {
    const engine = setup()
    const onAdded = vi.fn()
    const onRemoved = vi.fn()
    const disposed = vi.fn()
    let q!: Query<Position>
    class S extends System {
      override onAdded(e: Engine): void {
        onAdded(e)
        q = this.query({ all: [Position] })
        this.onDispose(disposed)
      }
      override onRemoved(): void {
        onRemoved()
      }
    }
    const s = engine.addSystem(S)
    expect(onAdded).toHaveBeenCalledWith(engine)
    expect(engine.queries.size).toBe(1)
    expect(engine.removeSystem(s)).toBe(true)
    expect(onRemoved).toHaveBeenCalled()
    expect(disposed).toHaveBeenCalled()
    expect(q.isDisposed).toBe(true)
    expect(engine.queries.size).toBe(0)
    expect(engine.removeSystem(s)).toBe(false)
    expect(engine.systems.get(S)).toBeUndefined()
  })

  it('fires timers once engine time passes and allows cancelling', () => {
    const engine = setup()
    const fired = vi.fn()
    const cancelled = vi.fn()
    class S extends System {
      override update(): void {
        if (this.engine.time === 0) {
          this.setTimeout(fired, 100)
          const cancel = this.setTimeout(cancelled, 100)
          expect(cancel()).toBe(true)
          expect(cancel()).toBe(false)
        }
      }
    }
    engine.addSystem(S)
    engine.update(0, 0)
    engine.update(50, 50)
    expect(fired).not.toHaveBeenCalled()
    engine.update(50, 100)
    expect(fired).toHaveBeenCalledTimes(1)
    engine.update(50, 150)
    expect(fired).toHaveBeenCalledTimes(1)
    expect(cancelled).not.toHaveBeenCalled()
  })

  it('iterates query entities from a system', () => {
    const engine = setup()
    class Move extends System {
      q!: Query<Position | Velocity>
      override onAdded(): void {
        this.q = this.query({ all: [Position, Velocity] })
      }
      override update(delta: number): void {
        for (const ent of this.q) {
          const p = ent.get(Position)
          const v = ent.get(Velocity)
          p.x += v.dx * delta
          p.y += v.dy * delta
        }
      }
    }
    engine.addSystem(Move)
    const e = engine.createEntity().add(Position).add(Velocity, { dx: 2, dy: 3 })
    engine.update(1, 1)
    engine.update(1, 2)
    expect(e.get(Position).x).toBe(4)
    expect(e.get(Position).y).toBe(6)
  })

  it('re-sorts when priorities change', () => {
    const engine = setup()
    const calls: string[] = []
    const a = engine.addSystem(() => calls.push('a'))
    engine.addSystem(() => calls.push('b'))
    a.priority = 1
    engine.systems.sort()
    engine.update(0, 0)
    expect(calls).toEqual(['b', 'a'])
  })
})
