export type EventMap = Record<string, unknown[]>
export type Listener<Args extends unknown[]> = (...args: Args) => void
type AnyListener = (...args: never) => void

/** A minimal typed event emitter. Listener sets are copied before emit, so listeners may unsubscribe while being called. */
export class Emitter<Events extends EventMap> {
  private readonly listeners = new Map<keyof Events, Set<AnyListener>>()

  on<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener as unknown as AnyListener)
    return () => this.off(event, listener)
  }

  once<K extends keyof Events>(event: K, listener: Listener<Events[K]>): () => void {
    const off = this.on(event, ((...args: Events[K]) => {
      off()
      listener(...args)
    }) as Listener<Events[K]>)
    return off
  }

  off<K extends keyof Events>(event: K, listener: Listener<Events[K]>): void {
    this.listeners.get(event)?.delete(listener as unknown as AnyListener)
  }

  emit<K extends keyof Events>(event: K, ...args: Events[K]): void {
    const set = this.listeners.get(event)
    if (!set || set.size === 0) return
    // Copy first so listeners can unsubscribe themselves or others while being called.
    const listeners = Array.from(set)
    for (const listener of listeners) (listener as unknown as Listener<Events[K]>)(...args)
  }

  listenerCount(event: keyof Events): number {
    return this.listeners.get(event)?.size ?? 0
  }

  clear(): void {
    this.listeners.clear()
  }
}
