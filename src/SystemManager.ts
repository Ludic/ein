import System from './System'
import SystemListener from './SystemListener'

type Klass<T> = { new (...args: any[]): T }

export default class SystemManager {
	private systems: System[] = []
	private systemMap = new WeakMap()
  private listener: SystemListener

  constructor(listener: SystemListener) {
	  this.listener = listener
  }

  public addSystem(system: System): void{
    // TODO check if system already exists, if so replace it
    this.systemMap.set(system.constructor, system)
	  this.systems.push(system)
	  this.systems.sort(this.systemComparator)
	  this.listener.systemAdded(system)
  }

  public removeSystem(system: System): void {
    const i = this.systems.indexOf(system)
    if(i > -1){
		  this.systems.splice(i, 1)
    }
    this.systemMap.delete(system.constructor)
	  this.listener.systemRemoved(system)
  }

  public removeAllSystems(): void {
    // TODO for pooling operations -> not implemented
    // this.systems.forEach((system: System) => {
    //   this.removeSystem(entity)
    // })
    this.systems = []
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
