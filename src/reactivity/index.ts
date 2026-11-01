/**
 * Optional helpers for using `@vue/reactivity` with ein. Requires `@vue/reactivity`
 * to be installed; everything it exports is re-exported here for convenience.
 */
export * from '@vue/reactivity'
import { reactive, shallowReactive } from '@vue/reactivity'
import type { ComponentOptions, ComponentType, Entity, Query } from '../index'

export interface ReactiveQuery<T extends object> {
  /** A shallow-reactive array that mirrors the query after every flush. */
  readonly entities: Entity<T>[]
  /** Stop mirroring the query. */
  dispose(): void
}

/** Mirror a query into a shallow-reactive array, for example to drive a UI list. */
export function reactiveQuery<T extends object>(query: Query<T>): ReactiveQuery<T> {
  const entities = shallowReactive<Entity<T>[]>([...query.entities])
  const offAdded = query.on('added', (entity) => {
    entities.push(entity)
  })
  const offRemoved = query.on('removed', (entity) => {
    const index = entities.indexOf(entity)
    if (index !== -1) entities.splice(index, 1)
  })
  return {
    entities,
    dispose(): void {
      offAdded()
      offRemoved()
    },
  }
}

export interface ReactiveComponentOptions {
  /** Make nested objects reactive too. Defaults to shallow. */
  deep?: boolean
}

/**
 * Component options that create every instance as a reactive proxy:
 * `engine.registerComponent(Position, reactiveComponent(Position))`.
 */
export function reactiveComponent<T extends object>(
  type: ComponentType<T>,
  options: ReactiveComponentOptions = {},
): Pick<ComponentOptions<T>, 'create'> {
  return {
    create: (): T =>
      options.deep ? (reactive(new type()) as unknown as T) : shallowReactive(new type()),
  }
}
