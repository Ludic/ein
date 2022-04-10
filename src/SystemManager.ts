import { Klass } from './Klass'
import { System } from './System'
import { Engine } from './Engine'
import { performance } from './Utils'
import { registerSystem } from './hmr/hmr'


export class SystemManager {
  engine: Engine
  systems: System[]

  constructor(engine: Engine){
    this.engine = engine
    this.systems = []

    // if(import.meta.env.DEV){
    //   if(import.meta.hot){
    //     import.meta.hot.on('ludic:register-system', (data)=>{
    //       console.log('on ludic:register-system', data)
    //     })
    //     import.meta.hot.on('ludic:update-system', (data)=>{
    //       console.log('on ludic:update-system', data)
    //     })
    //   }
    // }
  }

  addSystem(system_klass: Klass<System>, order?: number): System {
    let system: System = Reflect.construct(system_klass, [])
    system.order = order ?? this.systems.length
    system.engine = this.engine
    system.onAdded(this.engine)

    this.systems.push(system)
    this.sortSystems()

    if(import.meta.env.DEV){
      registerSystem(system)
    }

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

  update(delta: number, time: number, afterEach?: (system: System)=>void) {
    for(let i=0; i<this.systems.length; i++){
      const system: System = this.systems[i]
      if(system.shouldExecute()){
        system.update(delta, time)
        afterEach?.(system)
      }
    }
  }
}
