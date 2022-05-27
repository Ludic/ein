import { Component, ComponentConstructor } from './Component';
import { Entity } from './Entity';
import { Query } from './Query';
import { System } from './System';

export const COMPONENT_ENTITY_ID_MAP: Map<
  ComponentConstructor,
  Map<number, Component>
> = new Map()
export const ENTITY_ID_COMPONENT_MAP: Map<
  number,
  Set<ComponentConstructor>
> = new Map()

export const SYSTEM_QUERY_MAP: Map<
  System,
  Set<Query>
> = new Map()

export const SYSTEM_HANDLER_MAP: Map<
  System,
  Set<()=>void>
> = new Map()

let _system: System|null = null
export function trackSystem(system: System|null){
  _system = system
}

export function trackQuery(query: Query){
  if(_system){
    const set = SYSTEM_QUERY_MAP.get(_system) ?? new Set()
    SYSTEM_QUERY_MAP.set(_system, set)
    set.add(query)
  }
}

/**
 * registers an event handler for a system that will be called
 * when the system is removed. this is for automatic cleanup of
 * anything created in the onAdded system method.
 * 
 * @param handler handler to register
 */
export function trackHandler(handler: ()=>void){
  if(_system){
    const set = SYSTEM_HANDLER_MAP.get(_system) ?? new Set()
    SYSTEM_HANDLER_MAP.set(_system, set)
    set.add(handler)
  }
}

export function callHandlers(system: System){
  SYSTEM_HANDLER_MAP.get(system)?.forEach((handler)=>handler())
  SYSTEM_HANDLER_MAP.get(system)?.clear()
}
