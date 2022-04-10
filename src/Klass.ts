export interface Klass<T> {
  new (...args: any[]): T
  __id?: string
}
