# Changelog

## 2.0.0

A ground-up rewrite. The npm `latest` tag previously pointed at an unrelated
2017 package and the 1.x `dev` builds shipped without type declarations, so
2.0.0 is the first release of this codebase with working types.

### Breaking changes

- ESM only. `main`/`module`/UMD builds are gone; the `exports` map has `types`
  conditions for every entry. Developing the library needs Node 22.12 or newer.
- Manager fields are camelCase: `engine.entities`, `engine.components`,
  `engine.systems`, `engine.queries` (were `entity_manager` and friends).
- `entity.active` is `entity.alive`. Destroyed entities are released on the next
  flush and their storage slot is recycled; a stale handle stays dead and reads
  as empty.
- `query.entities`, `query.added` and `query.removed` are arrays, not sets, and
  `entities` is unordered. Queries are iterable.
- Systems no longer take constructor arguments. Set `priority`/`enabled` as
  fields or pass `{ priority, enabled }` to `addSystem()`. `onAdded()` still
  receives the engine, and `this.engine` is set before it runs.
- `trackHandler()` is replaced by `this.onDispose()` inside systems.
- Components are not pooled by default. Pass `{ pool: n }` to
  `registerComponent()` to opt in; pooled components should implement `reset()`.
- The `Pool` API is `acquire()`/`release()`.
- `@vue/reactivity` is no longer bundled or re-exported from the main entry. Use
  `@ludic/ein/reactivity`, which needs `@vue/reactivity` installed.
- Hot module replacement moved out of the core into `@ludic/ein/vite` (plugin)
  and `@ludic/ein/hmr` (runtime). `import.meta.env` and `import.meta.hot` are
  no longer referenced by the core, so it runs anywhere.

### Added

- Unlimited component types: entity masks are multi-word.
- Component ids and entity ids are per engine; several engines can coexist.
- Tags are queryable: `createQuery({ all: [Position, 'enemy'] })`.
- Typed entities: `entity.add(A)` returns `Entity<A>` with a non-nullable
  `get(A)`; `has()` narrows; query entity types are inferred from `all`.
- `Engine` option `flush: 'frame' | 'system'`, and `engine.flush()`. Query
  `added`/`removed` are per frame and identical for every system.
- Query `updated` event, `dispose()`, `first`, `size`, `has()`, `matches()`.
- Plain functions as systems, `System.query()`, `systems.get(Class)`.
- Typed `engine.events` for tooling.
- `engine.serialize()`, `entity.types()`, `entity.tags`, component `name` option.
- `ComponentManager.replace()` for hot reloading component classes.

### Fixed

- Reused pooled components kept the previous owner's field values.
- Masks broke silently past 31 component types.
- Destroyed entities were never released.
- Registering the same component class in two engines corrupted queries.
