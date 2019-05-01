import { assert } from 'chai'
import Component from '../src/Component'
import ComponentType from '../src/ComponentType'

import MovementComponent from './components/movement'

class ComponentA extends Component {}
class ComponentB extends Component {}

describe('ComponentType', () => {

  it('should have a valid ComponentType', async () => {
    assert.isNotNull(ComponentType.getFor(ComponentA))
    assert.isNotNull(ComponentType.getFor(ComponentB))
  })

  it('should have the same ComponentType', async () => {
    const componentType1: ComponentType = ComponentType.getFor(ComponentA)
	  const componentType2: ComponentType = ComponentType.getFor(ComponentA)
	  assert.equal(true, componentType1.equals(componentType2))
	  assert.equal(true, componentType2.equals(componentType1))
	  assert.equal(componentType1.getIndex(), componentType2.getIndex())
	  assert.equal(componentType1.getIndex(), ComponentType.getIndexFor(ComponentA))
    assert.equal(componentType2.getIndex(), ComponentType.getIndexFor(ComponentA))
  })

  it('should have different ComponentType(s)', async () => {
    const componentType1: ComponentType = ComponentType.getFor(ComponentA)
	  const componentType2: ComponentType = ComponentType.getFor(ComponentB)
	  assert.equal(false, componentType1.equals(componentType2))
	  assert.equal(false, componentType2.equals(componentType1))
	  assert.notEqual(componentType1.getIndex(), componentType2.getIndex())
	  assert.notEqual(componentType1.getIndex(), ComponentType.getIndexFor(ComponentB))
    assert.notEqual(componentType2.getIndex(), ComponentType.getIndexFor(ComponentA))
  })

  it('should have the same prototype for Class and instance', async () => {
    const componentA = new ComponentA()
    const componentB = new ComponentB()

	  assert.equal(componentA.constructor.prototype, ComponentA.prototype)
	  assert.equal(componentB.constructor.prototype, ComponentB.prototype)

	  assert.notEqual(componentA.constructor.prototype, ComponentB.prototype)
	  assert.notEqual(componentB.constructor.prototype, ComponentA.prototype)
  })

})
