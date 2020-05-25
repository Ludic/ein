import { assert } from 'chai'
import { Engine } from '../../src/Engine'
import { Component, SingletonComponent } from '../../src/Component'
import { ComponentManager } from '../../src/ComponentManager'


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

  it('should error on unregistered singleton component', ()=>{
    const engine: Engine = new Engine()
    
    class CameraComponent extends SingletonComponent {
      camera: any
    }
    
    assert.throws(()=>{
      engine.createEntity("player")
        .addComponent(CameraComponent)
    })
  })
  
  it('should add singleton component', ()=>{
    const engine: Engine = new Engine()
    
    class CameraComponent extends SingletonComponent {
      camera: any
    }

    engine.addSingletonComponent(CameraComponent, {camera: {}})
    
    engine.createEntity("player")
      .addComponent(CameraComponent)
  })
})
