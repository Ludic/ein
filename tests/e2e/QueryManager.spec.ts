import { assert } from 'chai'
import { Component, Query, Entity, System, Engine } from '../../dist/'
import { isReactive } from '@vue/reactivity'

describe('QueryManager', ()=>{

  it('entities by name', async()=>{
    const engine: Engine = new Engine()

    let query = engine.createQuery({
      name: 'player'
    })

    engine.createEntity("player")
    query.update()
    assert.equal(query.entities.length, 1)


    engine.createEntity("player")
    query.update()
    assert.equal(query.entities.length, 2)

    engine.createEntity("not a player")
    query.update()
    assert.equal(query.entities.length, 2)
  })

  it('entities by component', ()=>{
    const engine: Engine = new Engine()

    class PositionComponent extends Component {
      x: number
      y: number
    }

    let query = engine.createQuery({
      components: [PositionComponent],
    })

    engine.createEntity()
      .addComponent(PositionComponent, {x: 0, y: 0})

    // manually update the query
    query.update()

    assert.equal(query.entities.length, 1)
  })

  it('include entities', ()=>{
    const engine: Engine = new Engine()

    class ComponentA extends Component {
      a: any
    }
    class ComponentB extends Component {
      b: any
    }

    let query = engine.createQuery({
      components: {
        include: [ComponentA]
      },
    })

    engine.createEntity()
      .addComponent(ComponentA, {a: 0})
    engine.createEntity()
      .addComponent(ComponentB, {b: 0})

    // manually update the query
    query.update()

    assert.equal(query.entities.length, 1)
  })

  it('exclude entities', ()=>{
    const engine: Engine = new Engine()

    class ComponentA extends Component {
      a: any
    }
    class ComponentB extends Component {
      b: any
    }

    let query = engine.createQuery({
      components: {
        include: [ComponentA],
        exclude: [ComponentB],
      },
    })

    // excluded
    let a = engine.createEntity()
      .addComponent(ComponentA, {a: 0})
      .addComponent(ComponentB, {b: 0})
    // included
    let b = engine.createEntity()
      .addComponent(ComponentA, {a: 0})
    // excluded
    let c = engine.createEntity()
      .addComponent(ComponentB, {b: 0})

    // manually update the query
    query.update()

    assert.equal(query.entities.length, 1)
    assert.isTrue(query.entities.includes(b))
  })
})
