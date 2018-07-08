// TypeScript Definitions file
declare namespace ein {

  export class BaseEntity {
    active: boolean;
    priority: number;
    needsDestroy: boolean;
    _id: number;
    constructor(active?: boolean, priority?: number);
  }

  export interface SystemOptions {
    active?: boolean;
    priority?: number;
    update?: ()=>void;
  }

  export class BaseSystem<T extends BaseEntity> {
    active: boolean;
    priority: number;
    needsDestroy: boolean;
    entities: T[];
    _id: number;
    constructor(options: SystemOptions);
    constructor(active?: boolean, priority?: number, updateFunction?: (delta: number, engine?: Engine)=>void);
    onEntityAdded(entity: T): void;
    onEntityRemoved(entity: T): void;
    onSystemAdded(engine: Engine, entities: T[]): void;
    onSystemRemoved(engine: Engine): void;
    shouldUpdate(): boolean;
    update(delta: number, engine?: Engine): void;
  }

  export class Engine {
    constructor();
    addEntity(entity: BaseEntity): boolean | BaseEntity;
    removeEntity(entity: BaseEntity): boolean;
    getEntityById(id: number): boolean | BaseEntity;
    getEntitiesByProps(): BaseEntity[];
    getEntitiesByClassName(className: string): BaseEntity[];
    addSystem(system: BaseSystem): boolean | BaseSystem;
    removeSystem(system: BaseSystem): boolean;
    getSystemById(id: number): BaseSystem;
    update(delta: number);
  }  

}
export = ein;