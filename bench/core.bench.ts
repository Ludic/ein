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

function populated(): { engine: Engine; q: Query<Position | Velocity> } {
  const engine = new Engine({ entityAllocation: N })
  engine.registerComponent(Position, N).registerComponent(Velocity, N)
  const q = engine.createQuery({ all: [Position, Velocity] })
  for (let i = 0; i < N; i++) engine.createEntity().add(Position, { x: i }).add(Velocity)
  engine.update(0, 0)
  return { engine, q }
}

// Phase 0 baseline: results are written to bench/baseline/*.json and compared
// against the 2.0 implementation after the rewrite.
const baseline = (name: string): { writeResult: string } => ({
  writeResult: `bench/baseline/${name}.json`,
})

describe('core', () => {
  test('create', async ({ bench }) => {
    await bench(`create ${N} entities with two components`, baseline('create'), () => {
      const engine = new Engine({ entityAllocation: N })
      engine.registerComponent(Position, N).registerComponent(Velocity, N)
      for (let i = 0; i < N; i++) engine.createEntity().add(Position).add(Velocity)
      engine.update(0, 0)
    }).run()
  })

  test('iterate', async ({ bench }) => {
    const { q } = populated()
    await bench(`iterate ${N} entities and update two components`, baseline('iterate'), () => {
      q.entities.forEach((e) => {
        const p = e.get(Position)
        const v = e.get(Velocity)
        p.x += v.dx
        p.y += v.dy
      })
    }).run()
  })

  test('churn', async ({ bench }) => {
    const { engine, q } = populated()
    await bench(`remove and re-add a component on ${N} entities`, baseline('churn'), () => {
      q.entities.forEach((e) => e.remove(Velocity))
      engine.update(0, 0)
      engine.entity_manager.entities.forEach((e) => e.add(Velocity))
      engine.update(0, 0)
    }).run()
  })

  test('flush', async ({ bench }) => {
    const { engine } = populated()
    await bench(`update with no structural changes (${N} entities)`, baseline('flush'), () => {
      engine.update(0, 0)
    }).run()
  })
})
