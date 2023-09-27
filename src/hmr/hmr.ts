import { Component, ComponentConstructor } from '../Component'
import { COMPONENT_ENTITY_ID_MAP, SYSTEM_QUERY_MAP } from '../shared'
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
  reloadSystem: typeof reloadSystem
  reloadComponent: typeof reloadComponent
}

if(import.meta.env.DEV){
  getGlobalThis().__EIN_HMR_RUNTIME__ = {
    reloadSystem: tryWrap(reloadSystem),
    reloadComponent: tryWrap(reloadComponent),
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
      // clear the queries from the system map
      SYSTEM_QUERY_MAP.get(cfg.instance)?.forEach((query)=>{
        ENGINE.query_manager.queries.delete(query)
        SYSTEM_QUERY_MAP.get(cfg.instance)?.delete(query)
      })
      // remove the existing system instance from the manager and add the
      // new one with the same order
      ENGINE.system_manager.removeSystem(cfg.instance)
      ENGINE.system_manager.addSystem(systemClass, cfg.instance.order)
      console.log('reload system', id)
    }
  }
}

const COMPONENT_MAP: Map<string, {
  ctor: ComponentConstructor<Component>,
  allocate?: number
}> = new Map()

export function registerComponent(ctor: ComponentConstructor<Component>, allocate?: number){
  const id = ctor.__id
  if(id){
    COMPONENT_MAP.set(id, {
      ctor,
      allocate,
    })
  }
}

function reloadComponent(id: string, componentClass: ComponentConstructor<Component>){
  if(ENGINE){
    const cfg = COMPONENT_MAP.get(id)
    if(cfg){
      // to reload components we need to remove the previous component from the registry and 
      // register the new class
      const clsStore = COMPONENT_ENTITY_ID_MAP.get(cfg.ctor)

      ENGINE.component_manager.pools.delete(cfg.ctor)
      ENGINE.component_manager.registerComponent(componentClass, cfg.allocate, cfg.ctor.id)

      // then we need to replace every component
      if(clsStore){
        clsStore.forEach((inst, entId)=>{
          console.log('set new component data', inst)
          clsStore.set(entId, ENGINE.component_manager.getFreeComponent(componentClass, inst))
        })
        // update the comp/ent store to use the new ctor
        COMPONENT_ENTITY_ID_MAP.set(componentClass, clsStore)
      } else {
        console.log('no comp store', cfg, COMPONENT_ENTITY_ID_MAP)
      }
    } else {
      console.log('no cfg', id)
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