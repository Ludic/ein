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

  export class BaseSystem {
    active: boolean;
    priority: number;
    needsDestroy: boolean;
    entities: BaseEntity[];
    _id: number;
    constructor(options: SystemOptions);
    constructor(active?: boolean, priority?: number, updateFunction?: ()=>void);
    onEntityAdded(entity: BaseEntity);
    onEntityRemoved(entity: BaseEntity);
    onSystemAdded(engine: Engine, entities: BaseEntity[]);
    onSystemRemoved(engine: Engine);
    shouldUpdate(): boolean;
    update(delta: number);
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