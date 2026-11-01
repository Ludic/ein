import { describe, expect, it } from 'vitest'
import { effect, isReactive, reactiveComponent, reactiveQuery } from '@ludic/ein/reactivity'
import { Engine } from '@ludic/ein'
import { Position, setup } from './helpers'

describe('reactivity', () => {
  it('mirrors a query into a reactive array', () => {
    const engine = setup()
    const q = engine.createQuery({ all: [Position] })
    const first = engine.createEntity().add(Position)
    engine.flush()
    const mirror = reactiveQuery(q)
    expect(mirror.entities).toEqual([first])

    const sizes: number[] = []
    effect(() => sizes.push(mirror.entities.length))
    const second = engine.createEntity().add(Position)
    engine.update(0, 0)
    first.remove(Position)
    engine.update(0, 0)
    expect(mirror.entities).toEqual([second])
    expect(sizes).toEqual([1, 2, 1])

    mirror.dispose()
    engine.createEntity().add(Position)
    engine.update(0, 0)
    expect(mirror.entities).toEqual([second])
  })

  it('creates reactive component instances', () => {
    const engine = new Engine()
    class Nested {
      inner = { n: 0 }
      flat = 0
    }
    engine.registerComponent(Position, reactiveComponent(Position))
    engine.registerComponent(Nested, reactiveComponent(Nested, { deep: true }))
    const e = engine.createEntity().add(Position, { x: 1 }).add(Nested)
    const pos = e.get(Position)
    expect(isReactive(pos)).toBe(true)
    expect(pos).toBeInstanceOf(Position)
    expect(isReactive(e.get(Nested).inner)).toBe(true)

    const seen: number[] = []
    effect(() => seen.push(pos.x))
    pos.x = 2
    expect(seen).toEqual([1, 2])
  })
})
