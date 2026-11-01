import { describe, expectTypeOf, it } from 'vitest'
import { Engine, Entity, FunctionSystem, Query, System, type ComponentData } from '@ludic/ein'
import { Health, Position, Velocity } from './helpers'

describe('types', () => {
  const engine = new Engine()

  it('tracks known components on entities', () => {
    const e = engine.createEntity()
    expectTypeOf(e).toEqualTypeOf<Entity>()
    expectTypeOf(e.get(Position)).toEqualTypeOf<Position | undefined>()

    const withPos = e.add(Position)
    expectTypeOf(withPos).toEqualTypeOf<Entity<Position>>()
    expectTypeOf(withPos.get(Position)).toEqualTypeOf<Position>()
    expectTypeOf(withPos.get(Velocity)).toEqualTypeOf<Velocity | undefined>()

    const both = withPos.add(Velocity, { dx: 2 })
    expectTypeOf(both.get(Velocity)).toEqualTypeOf<Velocity>()
    expectTypeOf(both.remove(Position).get(Position)).toEqualTypeOf<Position | undefined>()
    expectTypeOf(both.remove(Position).get(Velocity)).toEqualTypeOf<Velocity>()

    if (e.has(Health)) expectTypeOf(e.get(Health)).toEqualTypeOf<Health>()
  })

  it('keeps typed entities assignable to plain entities', () => {
    const typed = engine.createEntity().add(Position).add(Velocity)
    const plain: Entity = typed
    expectTypeOf(plain.get(Position)).toEqualTypeOf<Position | undefined>()
    expectTypeOf<Entity<Position>>().toMatchTypeOf<Entity>()
    expectTypeOf<Entity>().not.toMatchTypeOf<Entity<Position>>()
  })

  it('only accepts writable data fields', () => {
    expectTypeOf<ComponentData<Position>>().toEqualTypeOf<{ x?: number; y?: number }>()
    class WithExtras {
      readonly id = 1
      value = 2
      method(): void {}
    }
    expectTypeOf<ComponentData<WithExtras>>().toEqualTypeOf<{ value?: number }>()
    // @ts-expect-error x must be a number
    engine.createEntity().add(Position, { x: 'nope' })
    // @ts-expect-error unknown field
    engine.createEntity().add(Position, { z: 1 })
  })

  it('infers query entity types from the all list', () => {
    const q = engine.createQuery({ all: [Position, Velocity], any: [Health], none: ['dead'] })
    expectTypeOf(q).toEqualTypeOf<Query<Position | Velocity>>()
    for (const e of q) {
      expectTypeOf(e).toEqualTypeOf<Entity<Position | Velocity>>()
      expectTypeOf(e.get(Position)).toEqualTypeOf<Position>()
      expectTypeOf(e.get(Health)).toEqualTypeOf<Health | undefined>()
    }
    const tags = engine.createQuery({ all: ['enemy', Position] })
    expectTypeOf(tags).toEqualTypeOf<Query<Position>>()
    const empty = engine.createQuery({})
    expectTypeOf(empty).toEqualTypeOf<Query<never>>()
    expectTypeOf(empty.first).toEqualTypeOf<Entity | undefined>()
    const plain: Query = q
    expectTypeOf(plain).toEqualTypeOf<Query>()
  })

  it('types systems', () => {
    class S extends System {
      value = 1
    }
    expectTypeOf(engine.addSystem(S)).toEqualTypeOf<S>()
    expectTypeOf(engine.addSystem(new S())).toEqualTypeOf<S>()
    expectTypeOf(engine.addSystem(() => {})).toEqualTypeOf<FunctionSystem>()
    expectTypeOf(engine.systems.get(S)).toEqualTypeOf<S | undefined>()
  })
})
