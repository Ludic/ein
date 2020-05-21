import { assert } from 'chai'
import { Component, ComponentManager, Entity, System, Engine } from '../../dist/'


class PositionComponent extends Component {
  x: number
  y: number
}


describe('ComponentManager', ()=>{

  it('addComponent()', async()=>{
    const engine: Engine = new Engine()
    const cm: ComponentManager = engine.component_manager
    engine
      .createEntity("player")
      .addComponent(PositionComponent, {x: 50, y: 50})

    assert.equal(cm.components.size, 1)
    assert.equal(!!cm.nameToComponents.get("PositionComponent") , true)
  })

})
