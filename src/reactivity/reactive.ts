import { track, trigger } from './lambda'
import { isObject, isArray, hasChanged } from '../Utils'

const targetProxies = new WeakMap<any, any>()
const proxyTargets = new WeakMap<any, any>()

export function reactive(target: any): any {

  if(targetProxies.has(target)){
    return targetProxies.get(target)
  }

  let proxy = new Proxy(target, {
    get(target: object, key: string | symbol, receiver: object) {
      const res = Reflect.get(target, key, receiver)
  
      track(target, key)

      return isObject(res) ? reactive(res) : res
    },
    set( target: object, key: string | symbol, value: unknown, receiver: object ): boolean {

      const oldValue = Reflect.get(target, key, receiver)

      const result = Reflect.set(target, key, value, receiver)
      
      trigger(target, key, value, oldValue)

      return result
    }
  })

  targetProxies.set(target, proxy)
  proxyTargets.set(proxy, target)

  return proxy
}
