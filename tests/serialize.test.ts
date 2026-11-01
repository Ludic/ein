import { describe, expect, it } from 'vitest'
import { Component, Engine, serializeComponent } from '@ludic/ein'
import { Health, Position, setup } from './helpers'

describe('serialization', () => {
  it('serializes an entity, its components and tags', () => {
    const engine = setup()
    const e = engine
      .createEntity('p')
      .add(Position, { x: 1, y: 2 })
      .add(Health, { value: 7 })
      .tag('enemy')
    expect(e.serialize()).toEqual({
      id: e.id,
      name: 'p',
      tags: ['enemy'],
      components: { Position: { x: 1, y: 2 }, Health: { value: 7 } },
    })
  })

  it('uses a custom serialize() and the registered name', () => {
    const engine = new Engine()
    class Secret extends Component {
      visible = 1
      hidden = 2
      override serialize(): Record<string, unknown> {
        return { visible: this.visible }
      }
    }
    class Plain {
      a = 1
      method(): number {
        return 2
      }
    }
    engine.registerComponent(Plain, { name: 'Renamed' })
    const e = engine.createEntity().add(Secret).add(Plain)
    expect(e.serialize().components).toEqual({ Secret: { visible: 1 }, Renamed: { a: 1 } })
    expect(serializeComponent(new Plain())).toEqual({ a: 1 })
  })
})
