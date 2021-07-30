import { assert } from 'chai'
import { Engine } from '../../src/Engine'
import { Component } from '../../src/Component'
import { ComponentManager } from '../../src/ComponentManager'


class PositionComponent extends Component {
  x: number = 0
  y: number = 0
}


describe('ComponentManager', ()=>{

  it('should register component', async()=>{
    const engine = new Engine()
    
    engine.registerComponent(PositionComponent)

    const comp = engine.component_manager.getFreeComponent(PositionComponent)
    assert.isNotNull(comp)
    assert.equal(comp.x, 0)
    assert.equal(comp.y, 0)
  })

  it('should set data', ()=>{
    const engine = new Engine()

    engine.registerComponent(PositionComponent)

    const comp = engine.component_manager.getFreeComponent(PositionComponent, {x: 4, y: 20})
    assert.isNotNull(comp)
    assert.equal(comp.x, 4)
    assert.equal(comp.y, 20)
  })
})
