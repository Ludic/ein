import { describe, expect, it, vi } from 'vitest'
import { Engine } from '@ludic/ein'
import { Health, Position, setup } from './helpers'

describe('engine', () => {
  it('starts empty', () => {
    const engine = new Engine()
    expect(engine.entities.size).toBe(0)
    expect(engine.systems.size).toBe(0)
    expect(engine.queries.size).toBe(0)
    expect(engine.components.size).toBe(0)
    expect(engine.enabled).toBe(true)
  })

  it('creates entities with a name and a unique id', () => {
    const engine = setup()
    const a = engine.createEntity('player')
    const b = engine.createEntity()
    expect(a.name).toBe('player')
    expect(b.name).toBe('')
    expect(a.id).not.toBe(b.id)
    expect(a.alive).toBe(true)
    expect(engine.getEntity(a.id)).toBe(a)
    expect(engine.entities.size).toBe(2)
    expect([...engine.entities]).toEqual([a, b])
  })

  it('records delta and time on update', () => {
    const engine = setup()
    engine.update(16, 1016)
    expect(engine.delta).toBe(16)
    expect(engine.time).toBe(1016)
  })

  it('releases destroyed entities on flush and recycles their slot', () => {
    const engine = setup()
    const a = engine.createEntity().add(Position)
    const slot = a.index
    engine.destroyEntity(a)
    expect(a.alive).toBe(false)
    expect(engine.entities.size).toBe(1)
    expect(a.get(Position)).toBeDefined()

    engine.update(0, 0)
    expect(engine.entities.size).toBe(0)
    expect(engine.getEntity(a.id)).toBeUndefined()
    expect(a.get(Position)).toBeUndefined()
    expect(a.alive).toBe(false)

    const b = engine.createEntity()
    expect(b.index).toBe(slot)
    expect(b.id).not.toBe(a.id)
    expect(b.has(Position)).toBe(false)
    expect(() => a.add(Position)).toThrow()
  })

  it('destroys through the entity and ignores double destroy', () => {
    const engine = setup()
    const destroyed = vi.fn()
    engine.events.on('entity:destroyed', destroyed)
    const e = engine.createEntity()
    e.destroy()
    e.destroy()
    engine.flush()
    expect(destroyed).toHaveBeenCalledTimes(1)
    expect(destroyed).toHaveBeenCalledWith(e)
  })

  it('clears all entities', () => {
    const engine = setup()
    engine.createEntity().add(Position)
    engine.createEntity().add(Health)
    engine.clear()
    expect(engine.entities.size).toBe(0)
  })

  it('emits lifecycle events', () => {
    const engine = new Engine()
    const seen: string[] = []
    for (const name of [
      'entity:created',
      'component:registered',
      'component:added',
      'component:removed',
      'update:start',
      'update:end',
      'flush',
    ] as const) {
      engine.events.on(name, () => seen.push(name))
    }
    engine.createEntity().add(Position).remove(Position)
    engine.update(0, 0)
    expect(seen).toEqual([
      'entity:created',
      'component:registered',
      'component:added',
      'component:removed',
      'update:start',
      'flush',
      'update:end',
    ])
  })

  it('serializes all live entities', () => {
    const engine = setup()
    engine.createEntity('a').add(Position, { x: 1 })
    const dead = engine.createEntity('b')
    dead.destroy()
    expect(engine.serialize()).toEqual({
      entities: [{ id: 0, name: 'a', tags: [], components: { Position: { x: 1, y: 0 } } }],
    })
  })

  it('keeps released handles inert after their slot is reused', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const stale = engine.createEntity('old').add(Position, { x: 1 }).tag('enemy')
    engine.update(0, 0)
    stale.destroy()
    expect(() => stale.add(Position, { x: 3 })).toThrow()
    engine.update(0, 0)
    const fresh = engine.createEntity('new').add(Position, { x: 2 }).tag('boss')
    engine.update(0, 0)
    expect(fresh.index).toBe(stale.index)

    expect(stale.get(Position)).toBeUndefined()
    expect(stale.has(Position)).toBe(false)
    expect(stale.is('boss')).toBe(false)
    expect(stale.tags).toEqual([])
    expect(stale.types()).toEqual([])
    expect(stale.serialize()).toEqual({ id: stale.id, name: 'old', tags: [], components: {} })
    expect(q.has(stale)).toBe(false)
    expect(q.has(fresh)).toBe(true)

    stale.remove(Position)
    stale.untag('boss')
    stale.destroy()
    engine.update(0, 0)
    expect(fresh.alive).toBe(true)
    expect(fresh.get(Position).x).toBe(2)
    expect(fresh.is('boss')).toBe(true)
    expect(q.size).toBe(1)
    expect(() => stale.add(Position)).toThrow()
    expect(() => stale.tag('x')).toThrow()
  })
})
