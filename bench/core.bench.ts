import { describe, test } from 'vitest'
import { Component, Engine, type Query } from '@ludic/ein'

class Position extends Component {
  x = 0
  y = 0
}
class Velocity extends Component {
  dx = 1
  dy = 1
}

const N = 10_000

function populated(options: { pool?: number } = {}): {
  engine: Engine
  q: Query<Position | Velocity>
} {
  const engine = new Engine({ capacity: N })
  engine.registerComponent(Position, options).registerComponent(Velocity, options)
  const q = engine.createQuery({ all: [Position, Velocity] })
  for (let i = 0; i < N; i++) engine.createEntity().add(Position, { x: i }).add(Velocity)
  engine.update(0, 0)
  return { engine, q }
}

const churn = (eng: Engine, query: Query<Position | Velocity>) => () => {
  for (const e of query.entities.slice()) e.remove(Velocity)
  eng.update(0, 0)
  for (const e of eng.entities) e.add(Velocity)
  eng.update(0, 0)
}

// Each benchmark is compared against the 1.x numbers recorded in bench/baseline.
describe('core', () => {
  test('create', async ({ bench }) => {
    await bench.compare(
      bench.from('1.x', 'bench/baseline/create.json'),
      bench(`2.0: create ${N} entities with two components`, () => {
        const engine = new Engine({ capacity: N })
        for (let i = 0; i < N; i++) engine.createEntity().add(Position).add(Velocity)
        engine.update(0, 0)
      }),
      bench(`2.0 pooled: create ${N} entities with two components`, () => {
        const engine = new Engine({ capacity: N })
        engine.registerComponent(Position, { pool: N }).registerComponent(Velocity, { pool: N })
        for (let i = 0; i < N; i++) engine.createEntity().add(Position).add(Velocity)
        engine.update(0, 0)
      }),
    )
  })

  test('iterate', async ({ bench }) => {
    const { q } = populated()
    await bench.compare(
      bench.from('1.x', 'bench/baseline/iterate.json'),
      bench(`2.0: iterate ${N} entities and update two components`, () => {
        for (const e of q) {
          const p = e.get(Position)
          const v = e.get(Velocity)
          p.x += v.dx
          p.y += v.dy
        }
      }),
    )
  })

  test('churn', async ({ bench }) => {
    const { engine, q } = populated()
    const pooled = populated({ pool: N })
    await bench.compare(
      bench.from('1.x', 'bench/baseline/churn.json'),
      bench(`2.0: remove and re-add a component on ${N} entities`, churn(engine, q)),
      bench(
        `2.0 pooled: remove and re-add a component on ${N} entities`,
        churn(pooled.engine, pooled.q),
      ),
    )
  })

  test('flush', async ({ bench }) => {
    const { engine } = populated()
    await bench.compare(
      bench.from('1.x', 'bench/baseline/flush.json'),
      bench(`2.0: update with no structural changes (${N} entities)`, () => {
        engine.update(0, 0)
      }),
    )
  })
})
