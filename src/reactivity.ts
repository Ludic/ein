export * from '@vue/reactivity'
import { effect, isReactive, isRef, Ref, stop } from '@vue/reactivity'
import { isArray, isObject } from './Utils'

// inspiration: https://antfu.me/posts/watch-with-reactivity
export function traverse(value: any, seen = new Set()) {
  if(!isObject(value) || seen.has(value)){
    return value
  }

  seen.add(value) // prevent circular reference 
  if(isArray(value)) {
    for(let i = 0; i < value.length; i++){
      traverse(value[i], seen)
    }
  } else {
    for(const key of Object.keys(value)){
      // @ts-ignore
      traverse(value[key], seen)
    }
  }
  return value
}
// export function traverse(value: unknown, seen?: Set<unknown>) {
//   if (!isObject(value) || (value as any)[ReactiveFlags.SKIP]) {
//     return value
//   }
//   seen = seen || new Set()
//   if (seen.has(value)) {
//     return value
//   }
//   seen.add(value)
//   if (isRef(value)) {
//     traverse(value.value, seen)
//   } else if (isArray(value)) {
//     for (let i = 0; i < value.length; i++) {
//       traverse(value[i], seen)
//     }
//   } else if (isSet(value) || isMap(value)) {
//     value.forEach((v: any) => {
//       traverse(v, seen)
//     })
//   } else if (isPlainObject(value)) {
//     for (const key in value) {
//       traverse((value as any)[key], seen)
//     }
//   }
//   return value
// }

export type WatchSource = Ref|(()=>void)
export type WatchOptions = {deep?: boolean, lazy?: boolean}
export function watch(source: WatchSource, fn: (val: any)=>void, { deep=false, lazy=true }: WatchOptions = {}) {
  let getter = isRef(source)
    ? () => source.value
    : isReactive(source) 
      ? () => source
      : source
    
  if(deep){
    getter = ()=>traverse(getter())
  }
    
  const runner = effect(getter, {
    lazy,
    scheduler: fn
  })

  return ()=>stop(runner)
}