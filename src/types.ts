type IfEquals<X, Y, A, B> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2 ? A : B

/** Keys of `T` that are not `readonly`. */
export type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
}[keyof T]

/** Keys of `T` whose values are not functions. */
export type NonFunctionKeys<T> = {
  [K in keyof T]-?: T[K] extends (...args: never[]) => unknown ? never : K
}[keyof T]

/** Keys of `T` that hold plain, writable data. */
export type DataKeys<T> = WritableKeys<T> & NonFunctionKeys<T>

/**
 * The plain-data part of a component: its writable, non-function fields, all optional.
 * This is what `entity.add(Type, data)` accepts.
 */
export type ComponentData<T> = Partial<Pick<T, DataKeys<T>>>
