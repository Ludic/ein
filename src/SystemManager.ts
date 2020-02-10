// [[file:~/repos/mine/README.org::*SystemManager][SystemManager:1]]
import { Engine } from './Engine'
import { System } from './System'
import { Klass } from './Klass'

export class SystemManager {
  engine: Engine
  systems: System[]
  executeSystems: System[]

  constructor(engine: Engine){
    this.systems = []
    this.executeSystems = [] // Systems that have `execute` method
    this.engine = engine
  }

  addSystem(system: System){
    system.engine = this.engine
    system.order = this.systems.length
    system.initQueries()

    this.systems.push(system)

    if(system.execute) this.executeSystems.push(system)
    this.sortSystems()
    return this
  }

  sortSystems(){
    this.executeSystems.sort((a: System, b: System) => {
      return a.priority - b.priority || a.order - b.order
    })
  }

  getSystem(klass: Klass<System>): System | undefined {
    return this.systems.find((s: System) => s instanceof klass)
  }

  getSystems() {
    return this.systems
  }

  removeSystem(system: System) {
    let index = this.systems.indexOf(system)
    if (!~index) return

    this.systems.splice(index, 1)
  }

  async execute(delta: number, time: number) {
    for(let i=0; i<this.executeSystems.length; i++){
      const system: System = this.executeSystems[i]
      if (system.enabled && system.initialized) {
        if (system.canExecute()) {
          // @ts-ignore
          let startTime = performance.now()

          // @ts-ignore
          await system.execute(delta, time)

          // @ts-ignore
          system.executeTime = performance.now() - startTime
        }
        system.clearEvents()
      }
    }

    // this.executeSystems.forEach((system: System) => {
    //   if (system.enabled && system.initialized) {
    //     if (system.canExecute()) {
    //       // @ts-ignore
    //       let startTime = performance.now()
    //       // @ts-ignore
    //       system.execute(delta, time)
    //       // @ts-ignore
    //       system.executeTime = performance.now() - startTime
    //     }
    //     system.clearEvents()
    //   }
    // })
  }

  stats() {
    let stats = {
      numSystems: this.systems.length,
      systems: {}
    }

    for (let i = 0; i < this.systems.length; i++) {
      let system = this.systems[i]
      // @ts-ignore
      let systemStats = (stats.systems[system.constructor.name] = {
        queries: {}
      })
    }

    return stats
  }
}
// SystemManager:1 ends here
