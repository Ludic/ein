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