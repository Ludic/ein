import { type BenchResult, describe, expect, test } from 'vitest'
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

const ms = (value: number): string =>
  value < 0.01 ? `${(value * 1000).toFixed(2)} µs` : `${value.toFixed(3)} ms`

/** Print mean latencies next to the 1.x baseline and assert 2.0 is not slower. */
function report(title: string, baseline: BenchResult, ...candidates: BenchResult[]): void {
  const lines = [`${title}: 1.x ${ms(baseline.latency.mean)}`]
  for (const c of candidates) {
    const ratio = baseline.latency.mean / c.latency.mean
    lines.push(`  ${c.name}: ${ms(c.latency.mean)} (${ratio.toFixed(1)}x faster)`)
    expect(c).toBeFasterThan(baseline)
  }
  process.stdout.write(lines.join('\n') + '\n')
}

// Each benchmark is compared against the 1.x numbers recorded in bench/baseline.
describe('core', () => {
  test('create', async ({ bench }) => {
    const r = await bench.compare(
      bench.from('1.x', 'bench/baseline/create.json'),
      bench('2.0', () => {
        const engine = new Engine({ capacity: N })
        for (let i = 0; i < N; i++) engine.createEntity().add(Position).add(Velocity)
        engine.update(0, 0)
      }),
      bench('2.0 pooled', () => {
        const engine = new Engine({ capacity: N })
        engine.registerComponent(Position, { pool: N }).registerComponent(Velocity, { pool: N })
        for (let i = 0; i < N; i++) engine.createEntity().add(Position).add(Velocity)
        engine.update(0, 0)
      }),
    )
    report(
      `create ${N} entities with two components`,
      r.get('1.x'),
      r.get('2.0'),
      r.get('2.0 pooled'),
    )
  })

  test('iterate', async ({ bench }) => {
    const { q } = populated()
    const r = await bench.compare(
      bench.from('1.x', 'bench/baseline/iterate.json'),
      bench('2.0', () => {
        for (const e of q) {
          const p = e.get(Position)
          const v = e.get(Velocity)
          p.x += v.dx
          p.y += v.dy
        }
      }),
    )
    report(`iterate ${N} entities and update two components`, r.get('1.x'), r.get('2.0'))
  })

  test('churn', async ({ bench }) => {
    const { engine, q } = populated()
    const pooled = populated({ pool: N })
    const r = await bench.compare(
      bench.from('1.x', 'bench/baseline/churn.json'),
      bench('2.0', churn(engine, q)),
      bench('2.0 pooled', churn(pooled.engine, pooled.q)),
    )
    report(
      `remove and re-add a component on ${N} entities`,
      r.get('1.x'),
      r.get('2.0'),
      r.get('2.0 pooled'),
    )
  })

  test('flush', async ({ bench }) => {
    const { engine } = populated()
    const r = await bench.compare(
      bench.from('1.x', 'bench/baseline/flush.json'),
      bench('2.0', () => {
        engine.update(0, 0)
      }),
    )
    report(`update with no structural changes (${N} entities)`, r.get('1.x'), r.get('2.0'))
  })
})
