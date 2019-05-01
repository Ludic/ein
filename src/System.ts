import Engine from './Engine'

/**
 * Abstract class for processing sets of [[Entity]] objects.
 */
export default abstract class System {
	// Use this to set the priority of the system. Lower means it'll get executed first.
	public priority: number

	private processing: boolean
	public engine: Engine | null

	/**
	 * Initialises the System with the priority specified.
	 * @param priority The priority to execute this system with (lower means higher priority).
	 */
	constructor(priority: number = 0){
		this.priority = priority
		this.processing = true
	}

	/**
	 * Called when this System is added to an [[Engine]].
	 * @param engine The [[Engine]] this system was added to.
	 */
	public addedToEngine(engine: Engine): void {}

	/**
	 * Called when this EntitySystem is removed from an [[Engine]].
	 * @param engine The [[Engine]] the system was removed from.
	 */
	public removedFromEngine(engine: Engine): void {}

	/**
	 * The update method called every tick.
	 * @param deltaTime The time passed since last frame in seconds.
	 */
	public update(deltaTime: number): void {}

	/** @return Whether or not the system should be processed. */
	public checkProcessing(): boolean {
		return this.processing
	}

	/** Sets whether or not the system should be processed by the [[Engine]]. */
	public setProcessing(processing: boolean): void {
		this.processing = processing
	}

	public getEngine(): Engine | null {
		return this.engine
	}

	public addedToEngineInternal(engine: Engine): void {
		this.engine = engine
		this.addedToEngine(engine)
	}

	public removedFromEngineInternal(engine: Engine): void {
		this.engine = null
		this.removedFromEngine(engine)
	}
}
