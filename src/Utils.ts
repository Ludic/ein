const toString = Object.prototype.toString
const hasOwnProperty = Object.prototype.hasOwnProperty

export function isObject(val: any): val is object {
  return val !== null && typeof val === 'object'
}

export const isArray = Array.isArray

export const isSymbol = (val: any): val is symbol => typeof val == 'symbol'

export function getType(val: any): string {
  return toString.call(val).slice(8, -1)
}

export function hasOwn(val: object, key: string | symbol): key is keyof typeof val {
  return hasOwnProperty.call(val, key)
}

export function hasChanged(value: any, oldValue: any): boolean {
  return value !== oldValue && (value === value || oldValue === oldValue)
}

export function setIntersection<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  // TEMP: use spread when this when vue bug is fixed https://github.com/vuejs/vue-next/issues/1210
  // return new Set([...setA].filter(i => setB.has(i)))
  let a = new Set<T>()
  setA.forEach(i => setB.has(i) ? a.add(i) : null)
  return a
}

export function setDifference<T>(setA: Set<T>, setB: Set<T>): Set<T> {
  return new Set([...setA].filter(i => !setB.has(i)))
}

export function bitShift(count: number){
  return 1 << count
}

export function bitSet(num: number, ...bits: number[]): number {
  // return num | bit
  return bits.reduce((agg, bit)=>agg|bit, num)
}

export function bitDel(num: number, ...bits: number[]){
  // return num & ~bit
  return bits.reduce((agg, bit)=>agg & ~bit, num)
}

export function bitMask(num1: number, num2: number){
  return num1 & num2
}


/**
 * Type Utils
 */

// https://stackoverflow.com/a/52473108
// https://github.com/Microsoft/TypeScript/issues/27024#issuecomment-421529650
type IfEquals<X, Y, A, B> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

// Alternatively:
/*
type IfEquals<X, Y, A, B> =
    [2] & [0, 1, X] extends [2] & [0, 1, Y] & [0, infer W, unknown]
    ? W extends 1 ? B : A
    : B;
*/

export type WritableKeysOf<T> = {
    [P in keyof T]: IfEquals<
        { [Q in P]: T[P] },
        { -readonly [Q in P]: T[P] },
        P,
        never
      >
}[keyof T];
export type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

// export type ExcludeFunctionProps<T> = Omit<T, { [K in keyof T]-?: T[K] extends (...any: [])=>any ? K : never }[keyof T]>


let perf = typeof window === 'undefined' ? undefined : window?.performance

if(typeof perf === 'undefined' && typeof require !== 'undefined'){
  perf = require('perf_hooks').performance
}

export const performance = perf as Performance
