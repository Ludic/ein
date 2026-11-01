import { Engine } from '@ludic/ein'
import { installHmr } from '@ludic/ein/hmr'
import { Position, Spin } from './components'
import { RenderSystem, SpinSystem } from './systems'

const engine = new Engine()
if (import.meta.hot) installHmr(engine)

engine.addSystem(SpinSystem)
engine.addSystem(RenderSystem)

engine.createEntity('hand').add(Position).add(Spin)
engine.createEntity('slow hand').add(Position).add(Spin, { speed: 0.25 })

let last = 0
function frame(time: number): void {
  engine.update(time - last, time)
  last = time
  requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
