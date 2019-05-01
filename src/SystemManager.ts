import System from './System'
import SystemListener from './SystemListener'
import { Klass } from './Klass'

export default class SystemManager {
	private systems: System[] = []
	private systemMap = new WeakMap()
  private listener: SystemListener

  constructor(listener: SystemListener) {
	  this.listener = listener
  }

  public addSystem(system: System): void{
    if(this.systemMap.get(system.constructor)){
      this.removeSystem(system)
    }
    this.systemMap.set(system.constructor, system)
	  this.systems.push(system)
	  this.systems.sort(this.systemComparator)
	  this.listener.systemAdded(system)
  }

  public removeSystem(system: System): void {
    for(let i=0; i < this.systems.length; i++){
      let s: System = this.systems[i]
      if(s.constructor.prototype == system.constructor.prototype){
        this.systems.splice(i, 1)
      }
    }
    this.systemMap.delete(system.constructor)
	  this.listener.systemRemoved(system)
  }

  public removeAllSystems(): void {
    while(this.systems.length){
      this.removeSystem(this.systems[0])
    }
  }

  public getSystem<T extends System>(systemClass: Klass<T>): T {
    return this.systemMap.get(systemClass)
  }

  public getSystems(): System[] {
	  return this.systems
  }

  private systemComparator(a: System, b: System): number {
    return a.priority > b.priority ? 1 : (a.priority == b.priority) ? 0 : -1
  }

}
