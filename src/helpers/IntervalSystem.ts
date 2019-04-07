import System from '../System'

/**
 * A simple [[System]] that does not run its update logic every call to {@link EntitySystem#update(float)}, but after a
 * given interval. The actual logic should be placed in {@link IntervalSystem#updateInterval()}.
 */
export default abstract class IteratingSystem extends System {
  private interval: number
  private accumulator: number

  constructor(interval: number, priority: number = 0){
    super(priority)
    this.interval = interval
    this.accumulator = 0
  }


  public update(deltaTime: number): void {
    this.accumulator += deltaTime
		while(this.accumulator >= this.interval) {
			this.accumulator -= this.interval
			this.updateInterval()
    }
  }

  protected abstract updateInterval(): void
}
