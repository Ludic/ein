import { Component } from '../../dist/cjs/Ein'

export default class MovementComponent extends Component {
	public velocityX: number
	public velocityY: number

	constructor(velocityX: number, velocityY: number) {
    super()
		this.velocityX = velocityX
		this.velocityY = velocityY
	}
}
