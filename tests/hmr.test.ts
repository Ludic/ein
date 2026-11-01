import { afterEach, describe, expect, it, vi } from 'vitest'
import { Engine, System, type Query } from '@ludic/ein'
import { createHmrRuntime, getHmrRuntime, installHmr } from '@ludic/ein/hmr'
import { Position, Velocity, setup } from './helpers'

describe('hmr runtime', () => {
  it('replaces systems in place, keeping priority, order and enabled state', () => {
    const engine = setup()
    const runtime = createHmrRuntime()
    runtime.register(engine)
    const calls: string[] = []
    class Move extends System {
      q!: Query<Position>
      override onAdded(): void {
        this.q = this.query({ all: [Position] })
      }
      override update(): void {
        calls.push('v1')
      }
    }
    class Other extends System {
      override update(): void {
        calls.push('other')
      }
    }
    const old = engine.addSystem(Move, { priority: 5, enabled: false })
    engine.addSystem(Other, { priority: 5 })
    expect(engine.queries.size).toBe(1)

    class Move2 extends System {
      override update(): void {
        calls.push('v2')
      }
    }
    expect(runtime.reload({ Move, unchanged: Other }, { Move: Move2, unchanged: Other })).toBe(1)
    const fresh = engine.systems.get(Move2)!
    expect(fresh).toBeDefined()
    expect(engine.systems.has(old)).toBe(false)
    expect(fresh.priority).toBe(5)
    expect(fresh.enabled).toBe(false)
    expect(fresh.order).toBe(old.order)
    expect(old.q.isDisposed).toBe(true)
    expect(engine.queries.size).toBe(0)
    fresh.enabled = true
    engine.update(0, 0)
    expect(calls).toEqual(['v2', 'other'])
  })

  it('replaces component types and migrates instance data', () => {
    const engine = setup()
    const runtime = createHmrRuntime()
    runtime.register(engine)
    const replaced = vi.fn()
    engine.events.on('component:replaced', replaced)
    const q = engine.createQuery({ all: [Position, Velocity] })
    const e = engine.createEntity().add(Position, { x: 3, y: 4 }).add(Velocity)
    engine.update(0, 0)
    const id = engine.components.get(Position)!.id

    class Position2 {
      x = 0
      y = 0
      z = 9
    }
    expect(runtime.reload({ Position }, { Position: Position2 })).toBe(1)
    // Modules that still import the old class keep working: it resolves to the new store.
    expect(engine.components.has(Position)).toBe(true)
    expect(engine.components.get(Position)!.type).toBe(Position2)
    expect(engine.components.get(Position2)).toMatchObject({ id, name: 'Position' })
    expect(e.get(Position)).toBe(e.get(Position2))
    expect(runtime.reload({ Position }, { Position: Position2 })).toBe(0)
    expect(e.has(Position2)).toBe(true)
    expect(e.get(Position2)).toMatchObject({ x: 3, y: 4, z: 9 })
    expect(e.get(Position2)).toBeInstanceOf(Position2)
    expect(replaced).toHaveBeenCalledTimes(1)
    expect(q.has(e)).toBe(true)
    const later = engine.createEntity().add(Position2).add(Velocity)
    engine.update(0, 0)
    expect(q.has(later)).toBe(true)
    expect(e.serialize().components['Position']).toEqual({ x: 3, y: 4, z: 9 })

    class Position3 {
      x = 0
      y = 0
      z = 0
      w = 1
    }
    expect(runtime.reload({ Position: Position2 }, { Position: Position3 })).toBe(1)
    expect(e.get(Position)).toBeInstanceOf(Position3)
    expect(e.get(Position)).toMatchObject({ x: 3, y: 4, z: 9, w: 1 })
    expect(engine.createEntity().add(Position).get(Position)).toBeInstanceOf(Position3)
    expect(runtime.reload({ Position: Position2 }, { Position: Position3 })).toBe(0)
  })

  it('ignores engines after they unregister', () => {
    const engine = setup()
    const runtime = createHmrRuntime()
    const off = runtime.register(engine)
    class S extends System {}
    class S2 extends System {}
    engine.addSystem(S)
    off()
    expect(runtime.reload({ S }, { S: S2 })).toBe(0)
    expect(engine.systems.get(S)).toBeDefined()
  })

  describe('global runtime', () => {
    afterEach(() => {
      delete (globalThis as { __EIN_HMR__?: unknown }).__EIN_HMR__
    })

    it('installs a shared runtime on globalThis', () => {
      const engine = new Engine()
      const uninstall = installHmr(engine)
      expect(getHmrRuntime()).toBe((globalThis as { __EIN_HMR__?: unknown }).__EIN_HMR__)
      expect(getHmrRuntime().engines.has(engine)).toBe(true)
      uninstall()
      expect(getHmrRuntime().engines.has(engine)).toBe(false)
    })
  })
})
