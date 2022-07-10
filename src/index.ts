/// <reference path="../node_modules/vite/client.d.ts" />
export type { Klass } from './Klass'

export { Component } from './Component'
export type { ComponentInstance, ComponentData, ComponentConstructor } from './Component'
export { ComponentManager } from './ComponentManager'

export { Entity } from './Entity'
export { EntityManager } from './EntityManager'

export { System } from './System'
export { SystemManager } from './SystemManager'

export { Query } from './Query'
export type { QueryOptions } from './Query'
export { QueryManager } from './QueryManager'

export { Engine } from './Engine'
export type { EngineOptions } from './Engine'

import * as Utils from './Utils'
export { Utils }

export * from './reactivity'

export { Pool } from './pool'
export type { ObjectPoolFactory } from './pool'

export { trackHandler } from './shared'

// export { default as VitePluginEin } from './hmr/plugin'
