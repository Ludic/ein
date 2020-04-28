import { isArray } from '../Utils'

export interface Lambda<T = any> {
  (...args: any[]): T
  deps: Dep[]
}

// const enum TrackOps {
//   GET = 'get',
//   HAS = 'has',
//   ITERATE = 'iterate'
// }

// const enum TriggerOps {
//   SET = 'set',
//   ADD = 'add',
//   DELETE = 'delete',
//   CLEAR = 'clear'
// }

type Dep = Set<Lambda>
type KeyToDepMap = Map<any, Dep>
const targetDepsMap = new WeakMap<any, KeyToDepMap>()

const lambdaStack: Lambda[] = []
let activeLambda: Lambda|undefined = undefined

export function lambda(fn: ()=>any) {
  const lambda = createLambda(fn)
  lambda()
  return lambda
}

function createLambda<T = any>(fn: (...args: any[])=>any): Lambda<T> {
  const lambda: Lambda<T> = function lambdaFn(...args: unknown[]): unknown {
    if(!lambdaStack.includes(lambda)){
      try {
        lambdaStack.push(lambda)
        activeLambda = lambda
        return fn(...args)
      } finally {
        lambdaStack.pop()
        activeLambda = lambdaStack[lambdaStack.length - 1]
      }
    }
  } as Lambda<T>

  lambda.deps = []

  return lambda
}

export function track(target: object, key: unknown) {
  if(activeLambda === undefined){
    return
  }

  let depsMap = targetDepsMap.get(target)

  if(!depsMap){
    depsMap = new Map()
    targetDepsMap.set(target, depsMap)
  }
  
  let dep = depsMap.get(key)
  
  if(!dep){
    dep = new Set()
    depsMap.set(key, dep)
  }

  if(!dep.has(activeLambda)){
    dep.add(activeLambda)
    activeLambda.deps.push(dep)
  }
}

export function trigger(target: object, key?: unknown, newValue?: unknown, oldValue?: unknown, oldTarget?: Map<unknown, unknown> | Set<unknown>) {
  const depsMap = targetDepsMap.get(target)
  if(!depsMap) return;

  const lambdas = new Set<Lambda>()

  const add = (lambdasToAdd: Set<Lambda> | undefined) => {
    if(lambdasToAdd) {
      lambdasToAdd.forEach(effect => {
        if(effect !== activeLambda) {
          lambdas.add(effect)
        }
      })
    }
  }

  
  if(key !== undefined) {
    add(depsMap.get(key))
  }

  const run = (effect: Lambda) => {
    effect()
  }

  lambdas.forEach(run)
}