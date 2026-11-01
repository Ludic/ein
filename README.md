# ein

A small, strongly typed Entity Component System for games, written in TypeScript.

- Components are plain classes. Entities are handles. Systems are classes or functions.
- Queries are live, typed and cheap: `for (const e of query) e.get(Position).x += 1`.
- Zero runtime dependencies. ESM only. Ships its own declarations.
- Optional entries for Vue reactivity and Vite hot module replacement.

```sh
npm install @ludic/ein
```

## Quick start

```ts
import { Component, Engine, System, type Query } from '@ludic/ein'

class Position extends Component {
  x = 0
  y = 0
}
class Velocity extends Component {
  dx = 0
  dy = 0
}

class Movement extends System {
  moving!: Query<Position | Velocity>

  override onAdded(): void {
    this.moving = this.query({ all: [Position, Velocity] })
  }

  override update(delta: number): void {
    for (const entity of this.moving) {
      const p = entity.get(Position) // typed as Position, never undefined
      const v = entity.get(Velocity)
      p.x += v.dx * delta
      p.y += v.dy * delta
    }
  }
}

const engine = new Engine()
engine.addSystem(Movement)
engine.createEntity('player').add(Position, { x: 10 }).add(Velocity, { dx: 1 })

let last = 0
requestAnimationFrame(function frame(time) {
  engine.update(time - last, time)
  last = time
  requestAnimationFrame(frame)
})
```

## Concepts

### Engine

The engine owns everything: `engine.entities`, `engine.components`,
`engine.systems`, `engine.queries` and a typed `engine.events` emitter.
Call `engine.update(delta, time)` once per frame. Several engines can coexist.

```ts
const engine = new Engine({ flush: 'frame', capacity: 1000 })
```

### Entities

```ts
const e = engine.createEntity('name') // Entity<never>: nothing known yet
e.add(Position, { x: 1 }) // Entity<Position>
e.has(Velocity) // type guard: narrows to Entity<Position | Velocity>
e.get(Position) // Position
e.get(Health) // Health | undefined
e.remove(Position)
e.tag('enemy').is('enemy') // string tags
e.destroy() // alive becomes false; released on the next flush
```

`id` is unique for the lifetime of the engine. `index` is the storage slot and
is recycled after destruction. Adding a component the entity already has only
assigns the data. Removed components stay readable until the next flush.

### Components

Any class with a no-argument constructor is a component; field initializers are
the defaults. Extending `Component` is optional and only adds a default
`serialize()`. Types register themselves on first use; register explicitly to
pass options:

```ts
engine.registerComponent(Position, {
  name: 'Position', // serialization name (defaults to the class name)
  pool: 500, // reuse instances; implement reset() to restore defaults
  create: () => new Position(), // custom factory
})
```

`entity.add(Type, data)` accepts the writable, non-function fields of the class
(`ComponentData<T>`), all optional.

### Queries

```ts
const q = engine.createQuery({
  all: [Position, Velocity], // every one of these; sets the entity type
  any: [Sprite, Mesh], // at least one
  none: ['dead'], // none of these; tag names work anywhere a class does
})
for (const e of q) {
}
q.entities // Entity<Position | Velocity>[], unordered
q.added // joined since the last frame the systems processed
q.removed // left since then
q.on('added', (e) => {}) // also 'removed' and 'updated'
q.dispose()
```

Membership changes when the engine flushes, not when components change. By
default that happens once at the start of `update()`, so every system sees the
same membership and the same `added`/`removed` lists for the whole frame. With
`new Engine({ flush: 'system' })` the engine also flushes after each system, so
later systems see what earlier ones changed. `engine.flush()` applies pending
changes immediately, for example after setup.

### Systems

```ts
class Spawner extends System {
  override priority = -1 // lower runs first; ties run in insertion order

  override onAdded(): void {
    const spawned = this.query({ all: [Position] }) // disposed with the system
    this.onDispose(() => spawned.dispose()) // any other cleanup
    this.setTimeout(() => console.log('one second of engine time'), 1000)
  }

  override update(delta: number, time: number): void {}
  override onRemoved(): void {}
}

engine.addSystem(Spawner)
engine.addSystem(new Spawner(), { priority: 2, enabled: false })
engine.addSystem((delta) => {}, { priority: 5 }) // plain functions work too
engine.removeSystem(engine.systems.get(Spawner)!)
```

Create queries in `onAdded()`, not in field initializers: `this.engine` is
assigned right before `onAdded()` runs.

### Events

```ts
engine.events.on('entity:created', (entity) => {})
engine.events.on('component:added', (entity, type, instance) => {})
engine.events.on('system:added', (system) => {})
engine.events.on('flush', () => {})
```

See `EngineEvents` for the full list.

### Serialization

`entity.serialize()` returns `{ id, name, tags, components }` where each
component is its own `serialize()` result or its enumerable fields.
`engine.serialize()` does this for every live entity.

## Optional entries

### `@ludic/ein/reactivity`

Requires `@vue/reactivity`. Re-exports it and adds two helpers.

```ts
import { reactiveComponent, reactiveQuery } from '@ludic/ein/reactivity'

engine.registerComponent(Position, reactiveComponent(Position)) // instances are reactive proxies
const list = reactiveQuery(query) // list.entities is a shallow-reactive array
```

### `@ludic/ein/vite` and `@ludic/ein/hmr`

Hot-swap systems and component classes without reloading the page.

```ts
// vite.config.ts
import ein from '@ludic/ein/vite'
export default { plugins: [ein()] }

// app entry
import { installHmr } from '@ludic/ein/hmr'
if (import.meta.hot) installHmr(engine)
```

Modules that import from `@ludic/ein` (or contain an `@ein-hmr` comment) become
self-accepting. On change, systems are replaced keeping their priority, order and
enabled state, and component classes are replaced keeping their id, options and
every instance's data. Keep systems and components in their own modules so the
module that creates the engine is not re-run.

## Migrating from 1.x

| 1.x                                     | 2.0                                                |
| --------------------------------------- | -------------------------------------------------- |
| `engine.entity_manager.entities`        | `engine.entities`                                  |
| `engine.system_manager.removeSystem`    | `engine.removeSystem`                              |
| `entity.active`                         | `entity.alive`                                     |
| `query.entities.forEach(...)`           | `for (const e of query)`                           |
| `query.entities.size`                   | `query.size`                                       |
| `new System(priority, enabled)`         | fields, or `addSystem(S, { priority, enabled })`   |
| `trackHandler(fn)`                      | `this.onDispose(fn)`                               |
| `pool.get()` / `pool.free()`            | `pool.acquire()` / `pool.release()`                |
| `import { reactive } from '@ludic/ein'` | `import { reactive } from '@ludic/ein/reactivity'` |
| components pooled by default            | `registerComponent(T, { pool: n })`                |

## Development

```sh
npm install
npm test          # vitest, including type tests
npm run bench     # compared against the 1.x baseline in bench/baseline
npm run examples  # vite dev server for examples/
npm run build     # tsdown: dist/*.js and dist/*.d.ts, checked with publint and attw
npm run check     # typecheck, lint, format, test, build
```

## License

ISC
