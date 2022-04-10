import { Engine } from '../Engine'
import { Klass } from '../Klass'
import { System } from '../System'

let _globalThis: any
export const getGlobalThis = (): any => {
  return (
    _globalThis ||
    (_globalThis =
      typeof globalThis !== 'undefined'
        ? globalThis
        : typeof self !== 'undefined'
        ? self
        : typeof window !== 'undefined'
        ? window
        : typeof global !== 'undefined'
        ? global
        : {})
  )
}

export interface EinHMRRuntime {

}

if(import.meta.env.DEV){
  getGlobalThis().__EIN_HMR_RUNTIME__ = {
    reloadSystem: tryWrap(reloadSystem)
  } as EinHMRRuntime
}

const SYSTEM_MAP: Map<string, {
  instance: System,
}> = new Map()
let ENGINE: Engine

export function registerSystem(system: System){
  // @ts-ignore
  const id = system.constructor.__id
  if(id){
    if(SYSTEM_MAP.has(id)){
      SYSTEM_MAP.get(id)!.instance = system
    } else {
      SYSTEM_MAP.set(id, {
        instance: system,
      })
    }
  }
}

export function registerEngine(engine: Engine){
  ENGINE = engine
}

function reloadSystem(id: string, systemClass: Klass<System>){
  if(ENGINE){
    const cfg = SYSTEM_MAP.get(id)
    if(cfg){
      ENGINE.system_manager.removeSystem(cfg.instance)
      ENGINE.system_manager.addSystem(systemClass, cfg.instance.order)
    }
  }
}

function tryWrap(fn: (id: string, arg: any) => any): Function {
  return (id: string, arg: any) => {
    try {
      return fn(id, arg)
    } catch (e: any) {
      console.error(e)
      console.warn(
        `[HMR] Something went wrong during hot-reload. ` +
          `Full reload required.`
      )
    }
  }
}