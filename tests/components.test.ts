import { describe, expect, it } from 'vitest'
import { Component, Engine } from '@ludic/ein'
import { Health, Position, Velocity, setup } from './helpers'

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

  it('assigns data when adding a component the entity already has', () => {
    const engine = setup()
    const e = engine.createEntity().add(Position, { x: 5, y: 9 })
    const first = e.get(Position)
    e.add(Position, { x: 1 })
    expect(e.get(Position)).toBe(first)
    expect(first.x).toBe(1)
    expect(first.y).toBe(9)
  })

  it('removes a component', () => {
    const engine = setup()
    const e = engine.createEntity().add(Position).add(Velocity)
    e.remove(Position)
    expect(e.has(Position)).toBe(false)
    expect(e.get(Position)).toBeUndefined()
    expect(e.has(Velocity)).toBe(true)
    expect(e.types()).toEqual([Velocity])
    e.remove(Position)
    expect(e.has(Velocity)).toBe(true)
  })

  it('registers component types on first use', () => {
    const engine = new Engine()
    class Lazy extends Component {
      n = 1
    }
    const e = engine.createEntity().add(Lazy)
    expect(e.get(Lazy).n).toBe(1)
    expect(engine.components.get(Lazy)?.name).toBe('Lazy')
    expect(engine.components.getByName('Lazy')?.type).toBe(Lazy)
    expect(engine.registerComponent(Lazy)).toBe(engine)
    expect(() => engine.registerComponent(Lazy, { pool: 2 })).toThrow()
  })

  it('rejects duplicate names and accepts a name override', () => {
    const engine = new Engine()
    class A {
      v = 1
    }
    class B {
      v = 2
    }
    engine.registerComponent(A, { name: 'Same' })
    expect(() => engine.registerComponent(B, { name: 'Same' })).toThrow()
    engine.registerComponent(B)
    expect(engine.components.get(A)?.name).toBe('Same')
    expect(engine.components.get(B)?.name).toBe('B')
  })

  it('keeps component ids per engine', () => {
    const e1 = new Engine()
    e1.registerComponent(Position).registerComponent(Velocity)
    const q1 = e1.createQuery({ all: [Velocity] })
    const e2 = new Engine()
    e2.registerComponent(Velocity).registerComponent(Position)
    const a = e1.createEntity().add(Velocity)
    e1.update(0, 0)
    expect([...q1]).toEqual([a])
    expect(e1.components.get(Velocity)?.id).toBe(1)
    expect(e2.components.get(Velocity)?.id).toBe(0)
  })

  it('supports more than 31 component types', () => {
    const engine = new Engine()
    const types = Array.from({ length: 70 }, (_, i) => {
      const C = class {
        v = i
      }
      engine.registerComponent(C, { name: `C${i}` })
      return C
    })
    const last = types[69]!
    const q = engine.createQuery({ all: [last] })
    const q32 = engine.createQuery({ all: [types[32]!], none: [types[40]!] })
    const a = engine.createEntity().add(last)
    const b = engine.createEntity()
    for (const T of types.slice(0, 40)) b.add(T)
    const c = engine.createEntity().add(types[32]!).add(types[40]!)
    engine.update(0, 0)
    expect([...q]).toEqual([a])
    expect([...q32]).toEqual([b])
    expect(engine.masks.words).toBe(3)
    expect(b.types().length).toBe(40)
    expect(c.has(types[40]!)).toBe(true)
  })

  it('registering a component after entities exist keeps their masks', () => {
    const engine = new Engine()
    const first = Array.from({ length: 31 }, (_, i) => {
      const C = class {
        v = i
      }
      engine.registerComponent(C, { name: `C${i}` })
      return C
    })
    const e = engine.createEntity()
    for (const T of first) e.add(T)
    const q = engine.createQuery({ all: first })
    engine.update(0, 0)
    expect(q.size).toBe(1)
    class Late {
      v = 99
    }
    const late = engine.createQuery({ all: [...first, Late] })
    e.add(Late)
    engine.update(0, 0)
    expect(q.size).toBe(1)
    expect(late.size).toBe(1)
    expect(e.types().length).toBe(32)
  })

  describe('pooling', () => {
    it('reuses instances and restores defaults', () => {
      const engine = new Engine()
      engine.registerComponent(Position, { pool: 1 })
      const a = engine.createEntity().add(Position, { x: 5, y: 9 })
      const inst = a.get(Position)
      a.remove(Position)
      engine.flush()
      const b = engine.createEntity().add(Position, { x: 1 })
      expect(b.get(Position)).toBe(inst)
      expect(b.get(Position).x).toBe(1)
      expect(b.get(Position).y).toBe(0)
    })

    it('calls reset() on reuse when available', () => {
      const engine = new Engine()
      class Buffer {
        items: number[] = []
        reset(): void {
          this.items = []
        }
      }
      engine.registerComponent(Buffer, { pool: 1 })
      const a = engine.createEntity().add(Buffer)
      a.get(Buffer).items.push(1)
      a.destroy()
      engine.flush()
      const b = engine.createEntity().add(Buffer)
      expect(b.get(Buffer).items).toEqual([])
    })

    it('does not hand out an instance that is still readable before flush', () => {
      const engine = new Engine()
      engine.registerComponent(Position, { pool: 1 })
      const a = engine.createEntity().add(Position, { x: 5 })
      const inst = a.get(Position)
      a.remove(Position)
      const b = engine.createEntity().add(Position)
      expect(b.get(Position)).not.toBe(inst)
      expect(inst.x).toBe(5)
    })
  })

  it('uses a custom factory', () => {
    const engine = new Engine()
    const made: Health[] = []
    engine.registerComponent(Health, {
      create: () => {
        const h = new Health()
        made.push(h)
        return h
      },
    })
    const e = engine.createEntity().add(Health, { value: 3 })
    expect(made).toHaveLength(1)
    expect(e.get(Health)).toBe(made[0])
    expect(e.get(Health).value).toBe(3)
  })
})

describe('tags', () => {
  it('tags, untags and checks entities', () => {
    const engine = setup()
    const e = engine.createEntity().tag('enemy')
    expect(e.is('enemy')).toBe(true)
    expect(e.is('player')).toBe(false)
    expect(e.tags).toEqual(['enemy'])
    e.untag('enemy')
    e.untag('never-used')
    expect(e.is('enemy')).toBe(false)
    expect(e.tags).toEqual([])
    expect(engine.components.get(engine.tag('enemy'))?.isTag).toBe(true)
  })

  it('are queryable by name or by tag type', () => {
    const engine = setup()
    const byName = engine.createQuery({ all: [Position, 'enemy'], none: ['dead'] })
    const byType = engine.createQuery({ any: [engine.tag('enemy')] })
    const a = engine.createEntity().add(Position).tag('enemy')
    const b = engine.createEntity().add(Position).tag('enemy').tag('dead')
    const c = engine.createEntity().add(Position)
    engine.update(0, 0)
    expect([...byName]).toEqual([a])
    expect(new Set(byType.entities)).toEqual(new Set([a, b]))
    expect(byName.has(c)).toBe(false)
  })
})
