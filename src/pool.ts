/** A simple stack-based object pool. */
export class Pool<T> {
  private readonly free: T[] = []
  private readonly factory: () => T
  private created = 0

  constructor(factory: () => T, initial: number = 0) {
    this.factory = factory
    this.reserve(initial)
  }

  /** Pre-allocate `count` objects. */
  reserve(count: number): void {
    for (let i = 0; i < count; i++) {
      this.free.push(this.factory())
      this.created++
    }
  }

  /** Take an object from the pool, creating one if the pool is empty. */
  acquire(): T {
    const obj = this.free.pop()
    if (obj !== undefined) return obj
    this.created++
    return this.factory()
  }

  /** Return an object to the pool. The caller must not use it afterwards. */
  release(obj: T): void {
    this.free.push(obj)
  }

  /** Objects currently waiting in the pool. */
  get available(): number {
    return this.free.length
  }

  /** Total objects ever created by this pool. */
  get size(): number {
    return this.created
  }
}
