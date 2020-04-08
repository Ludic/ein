import { Klass, System, Engine } from './'

export class SystemManager {
  engine: Engine
  systems: System[]

  constructor(engine: Engine){
    this.engine = engine
    this.systems = []
  }

  addSystem(system_klass: Klass<System>): System {
    let system: System = new system_klass()
    system.order = this.systems.length
    system.onAdded(this.engine)

    this.systems.push(system)
    this.sortSystems()

    return system
  }

  sortSystems(): void {
    this.systems.sort((a: System, b: System) => {
      return a.priority - b.priority || a.order - b.order
    })
  }

  removeSystem(system: System): boolean {
    let index: number = this.systems.indexOf(system)
    if(index == -1) return false
    this.systems.splice(index, 1)
    return true
  }

  async execute(delta: number, time: number): Promise<void> {
    for(let i=0; i<this.systems.length; i++){
      const system: System = this.systems[i]
      if(system.shouldExecute()){
        await system.execute(delta, time)
      }
    }
  }
}
