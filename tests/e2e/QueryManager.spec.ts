import { assert } from 'chai'
import { Engine } from '../../src/Engine'
import { Component } from '../../src/Component'

class Position extends Component {
  // static property: 'pos' = 'pos'
  // static data = {
  //   x: 0,
  //   y: 0,
  // }
  x = 0
  y = 0
}

describe('QueryManager', ()=>{

  it('should flush:post', async()=>{
    const engine: Engine = new Engine()

    engine.registerComponent(Position)

    let query = engine.createQuery({
      any: [Position],
    })

    const ent = engine.createEntity()
      .addComponent(Position)
    
    // should be zero since it flushes post update
    assert.equal(query.entities.size, 0)

    engine.update(0, 0)

    assert.equal(query.entities.size, 1)
  })

  // it('should flush:immediate', ()=>{
  //   const engine: Engine = new Engine()

  //   engine.registerComponent(Position)

  //   let query = engine.createQuery({
  //     any: [Position],
  //     flush: 'immediate',
  //   })

  //   const ent = engine.createEntity()
  //     .addComponent(Position)

  //   // no need to call engine.update since the query flushes after every component add
  //   assert.equal(query.entities.size, 1)
  // })

  it('should remove component', ()=>{
    const engine: Engine = new Engine()

    engine.registerComponent(Position)

    let query = engine.createQuery({
      any: [Position],
      flush: 'immediate',
    })

    const ent = engine.createEntity()
      .addComponent(Position)

    // should be zero since it flushes post update
    assert.equal(query.entities.size, 0)
    engine.update(0, 0)
    assert.equal(query.entities.size, 1)
    
    ent.removeComponent(Position)
    assert.equal(query.entities.size, 1)
    engine.update(0, 0)
    assert.equal(query.entities.size, 0)

  })

  // it('entities by component', ()=>{
  //   const engine: Engine = new Engine()

  //   class PositionComponent extends Component {
  //     x: number
  //     y: number
  //   }

  //   let query = engine.createQuery({
  //     components: [PositionComponent],
  //   })

  //   engine.createEntity()
  //     .addComponent(PositionComponent, {x: 0, y: 0})

  //   // manually update the query
  //   query.update()

  //   assert.equal(query.entities.length, 1)
  // })

  // it('include entities', ()=>{
  //   const engine: Engine = new Engine()

  //   class ComponentA extends Component {
  //     a: any
  //   }
  //   class ComponentB extends Component {
  //     b: any
  //   }
  //   class ComponentC extends Component {
  //     c: any
  //   }

  //   let query = engine.createQuery({
  //     components: {
  //       include: [ComponentA, ComponentC]
  //     },
  //   })

  //   engine.createEntity()
  //     .addComponent(ComponentA, {a: 0})
  //     .addComponent(ComponentC, {c: 0})
  //   engine.createEntity()
  //     .addComponent(ComponentB, {b: 0})
  //     .addComponent(ComponentC, {c: 0})

  //   // manually update the query
  //   query.update()

  //   assert.equal(query.entities.length, 1)
  // })

  // it('exclude entities', ()=>{
  //   const engine: Engine = new Engine()

  //   class ComponentA extends Component {
  //     a: any
  //   }
  //   class ComponentB extends Component {
  //     b: any
  //   }

  //   let query = engine.createQuery({
  //     components: {
  //       include: [ComponentA],
  //       exclude: [ComponentB],
  //     },
  //   })

  //   // excluded
  //   let a = engine.createEntity()
  //     .addComponent(ComponentA, {a: 0})
  //     .addComponent(ComponentB, {b: 0})
  //   // included
  //   let b = engine.createEntity()
  //     .addComponent(ComponentA, {a: 0})
  //   // excluded
  //   let c = engine.createEntity()
  //     .addComponent(ComponentB, {b: 0})

  //   // manually update the query
  //   query.update()

  //   assert.equal(query.entities.length, 1)
  //   assert.isTrue(query.entities.includes(b))
  // })
})
