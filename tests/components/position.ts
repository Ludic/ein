import Component from '../../src/Component'

export default class PositionComponent extends Component {
	public x: number
	public y: number

	constructor(x: number, y: number) {
    super()
		this.x = x
		this.y = y
	}
}
