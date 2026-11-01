/**
 * Characterization tests written against the 1.x source before the 2.0 rewrite.
 * They pin down the behaviour we intend to keep. Tests marked `it.fails` document
 * known 1.x bugs: they are expected to fail now and must pass after the rewrite.
 */
import { describe, expect, it, vi } from 'vitest'
import { Component, Engine, Pool, Query, System, type Entity } from '@ludic/ein'

class Position extends Component {
  x = 0
  y = 0
}
class Velocity extends Component {
  dx = 1
  dy = 1
}
class Health extends Component {
  value = 100
}

function setup(): Engine {
  const engine = new Engine()
  engine.registerComponent(Position).registerComponent(Velocity).registerComponent(Health)
  return engine
}

describe('engine', () => {
  it('starts empty', () => {
    const engine = new Engine()
    expect(engine.entity_manager.entities.size).toBe(0)
    expect(engine.system_manager.systems.length).toBe(0)
    expect(engine.query_manager.queries.size).toBe(0)
    expect(engine.enabled).toBe(true)
  })

  it('creates entities with a name and a unique id', () => {
    const engine = setup()
    const a = engine.createEntity('player')
    const b = engine.createEntity()
    expect(a.name).toBe('player')
    expect(b.name).toBe('')
    expect(a.id).not.toBe(b.id)
    expect(a.active).toBe(true)
    expect(engine.getEntity(a.id)).toBe(a)
    expect(engine.entity_manager.entities.size).toBe(2)
  })

  it('records delta and time on update', () => {
    const engine = setup()
    engine.update(16, 1016)
    expect(engine.delta).toBe(16)
    expect(engine.time).toBe(1016)
  })
})

describe('components', () => {
  it('adds a component with class defaults', () => {
    const engine = setup()
    const e = engine.createEntity().add(Position)
    const pos = e.get(Position)
    expect(pos).toBeInstanceOf(Position)
    expect(pos.x).toBe(0)
    expect(pos.y).toBe(0)
    expect(e.has(Position)).toBe(true)
    expect(e.has(Velocity)).toBe(false)
  })

  it('adds a component with partial data', () => {
    const engine = setup()
    const e = engine.createEntity().add(Position, { x: 5 })
    expect(e.get(Position).x).toBe(5)
    expect(e.get(Position).y).toBe(0)
  })

  it('removes a component', () => {
    const engine = setup()
    const e = engine.createEntity().add(Position).add(Velocity)
    e.remove(Position)
    expect(e.has(Position)).toBe(false)
    expect(e.get(Position)).toBeUndefined()
    expect(e.has(Velocity)).toBe(true)
  })

  it('throws when adding an unregistered component', () => {
    const engine = new Engine()
    expect(() => engine.createEntity().add(Position)).toThrow()
  })

  it.fails('restores class defaults when a pooled component is reused (1.x leaks stale fields)', () => {
    const engine = setup()
    const a = engine.createEntity().add(Position, { x: 5, y: 9 })
    a.remove(Position)
    const b = engine.createEntity().add(Position, { x: 1 })
    expect(b.get(Position).y).toBe(0)
  })

  it.fails('keeps component ids per engine (1.x writes ids onto the class)', () => {
    const e1 = new Engine()
    e1.registerComponent(Position).registerComponent(Velocity)
    const q1 = e1.createQuery({ all: [Velocity] })
    // registering in a different order on a second engine must not disturb the first
    const e2 = new Engine()
    e2.registerComponent(Velocity).registerComponent(Position)
    const a = e1.createEntity().add(Velocity)
    e1.update(0, 0)
    expect([...q1.entities]).toEqual([a])
  })

  it.fails('supports more than 31 component types (1.x masks are 32-bit ints)', () => {
    const engine = new Engine()
    const types = Array.from({ length: 40 }, (_, i) => {
      const C = class extends Component {
        v = i
      }
      engine.registerComponent(C)
      return C
    })
    const last = types[39]!
    const q = engine.createQuery({ all: [last] })
    const a = engine.createEntity().add(last)
    const b = engine.createEntity()
    for (const T of types.slice(0, 32)) b.add(T)
    engine.update(0, 0)
    expect([...q.entities]).toEqual([a])
  })
})

describe('tags', () => {
  it('tags, untags and checks entities', () => {
    const engine = setup()
    const e = engine.createEntity().tag('enemy')
    expect(e.is('enemy')).toBe(true)
    expect(e.is('player')).toBe(false)
    e.untag('enemy')
    expect(e.is('enemy')).toBe(false)
  })
})

describe('queries', () => {
  it('applies membership on update, not immediately', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const e = engine.createEntity().add(Position)
    expect(q.entities.size).toBe(0)
    engine.update(0, 0)
    expect(q.entities.size).toBe(1)
    expect(q.entities.has(e)).toBe(true)
  })

  it('matches all / any / none', () => {
    const engine = setup()
    const all = engine.createQuery({ all: [Position, Velocity] })
    const any = engine.createQuery({ any: [Position, Health] })
    const none = engine.createQuery({ all: [Position], none: [Health] })
    const a = engine.createEntity().add(Position).add(Velocity)
    const b = engine.createEntity().add(Position).add(Health)
    const c = engine.createEntity().add(Velocity)
    engine.update(0, 0)
    expect([...all.entities]).toEqual([a])
    expect(new Set(any.entities)).toEqual(new Set([a, b]))
    expect([...none.entities]).toEqual([a])
    expect(all.entities.has(c)).toBe(false)
  })

  it('tracks added and removed per frame and fires listeners', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const added = vi.fn()
    const removed = vi.fn()
    q.on('added', added)
    q.on('removed', removed)

    const e = engine.createEntity().add(Position)
    engine.update(0, 0)
    expect([...q.added]).toEqual([e])
    expect(q.removed.size).toBe(0)
    expect(added).toHaveBeenCalledWith(e)

    engine.update(0, 0)
    expect(q.added.size).toBe(0)

    e.remove(Position)
    engine.update(0, 0)
    expect([...q.removed]).toEqual([e])
    expect(q.entities.size).toBe(0)
    expect(removed).toHaveBeenCalledWith(e)
  })

  it('drops destroyed entities after update and deactivates them immediately', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const e = engine.createEntity().add(Position)
    engine.update(0, 0)
    engine.destroyEntity(e)
    expect(e.active).toBe(false)
    expect(q.entities.size).toBe(1)
    engine.update(0, 0)
    expect(q.entities.size).toBe(0)
  })

  it.fails('releases destroyed entities from the engine (1.x never drains its free queue)', () => {
    const engine = setup()
    const e = engine.createEntity()
    engine.destroyEntity(e)
    engine.update(0, 0)
    expect(engine.entity_manager.entities.size).toBe(0)
    expect(engine.getEntity(e.id)).toBeUndefined()
  })

  it('disposes listeners', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const added = vi.fn()
    const off = q.on('added', added)
    off()
    engine.createEntity().add(Position)
    engine.update(0, 0)
    expect(added).not.toHaveBeenCalled()
  })
})

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
      constructor() {
        super(-1)
      }
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
    engine.update(1, 1)
    expect(calls).toEqual(['b', 'a', 'c'])
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

  it('calls lifecycle hooks and gives systems the engine', () => {
    const engine = setup()
    const onAdded = vi.fn()
    const onRemoved = vi.fn()
    class S extends System {
      override onAdded(e: Engine): void {
        super.onAdded(e)
        onAdded(e)
      }
      override onRemoved(): void {
        onRemoved()
      }
    }
    const s = engine.addSystem(S)
    expect(s.engine).toBe(engine)
    expect(onAdded).toHaveBeenCalledWith(engine)
    expect(engine.system_manager.removeSystem(s)).toBe(true)
    expect(onRemoved).toHaveBeenCalled()
    expect(engine.system_manager.removeSystem(s)).toBe(false)
  })

  it('fires timers once engine time passes and allows cancelling', () => {
    const engine = setup()
    const fired = vi.fn()
    const cancelled = vi.fn()
    class S extends System {
      override onAdded(e: Engine): void {
        super.onAdded(e)
      }
      override update(): void {
        if (this.engine.time === 0) {
          this.setTimeout(fired, 100)
          const cancel = this.setTimeout(cancelled, 100)
          cancel()
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
      override onAdded(e: Engine): void {
        super.onAdded(e)
        this.q = e.createQuery({ all: [Position, Velocity] })
      }
      override update(delta: number): void {
        this.q.entities.forEach((ent: Entity<Position | Velocity>) => {
          const p = ent.get(Position)
          const v = ent.get(Velocity)
          p.x += v.dx * delta
          p.y += v.dy * delta
        })
      }
    }
    engine.addSystem(Move)
    const e = engine.createEntity().add(Position).add(Velocity, { dx: 2, dy: 3 })
    engine.update(1, 1)
    engine.update(1, 2)
    expect(e.get(Position).x).toBe(4)
    expect(e.get(Position).y).toBe(6)
  })
})

describe('serialization', () => {
  it('serializes an entity and its components', () => {
    const engine = setup()
    const e = engine.createEntity('p').add(Position, { x: 1, y: 2 }).add(Health, { value: 7 })
    expect(e.serialize()).toEqual({
      id: e.id,
      components: { Position: { x: 1, y: 2 }, Health: { value: 7 } },
    })
  })
})

describe('pool', () => {
  it('hands out objects and takes them back', () => {
    let n = 0
    const pool = new Pool(() => ({ n: n++ }), 2)
    expect(pool.size).toBe(2)
    expect(pool.available).toBe(2)
    const a = pool.get()
    const b = pool.get()
    expect(pool.available).toBe(0)
    const c = pool.get()
    expect(pool.size).toBeGreaterThan(2)
    pool.free(a)
    pool.free(b)
    pool.free(c)
    expect(pool.available).toBe(pool.size)
  })
})
