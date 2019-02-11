import { Component } from '@lib/component'

export default class PositionComponent implements Component {
	public x: number
	public y: number

	constructor(x: number, y: number) {
		this.x = x
		this.y = y
	}
}
