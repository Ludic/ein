import { Engine } from './engine'

type Klass<T> = { new (...args: any[]): T }

/**
 * Abstract class for processing sets of [[Entity]] objects.
 */
export abstract class System {
	// Use this to set the priority of the system. Lower means it'll get executed first.
	public priority: number

	private processing: boolean
	private engine: Engine | null

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


/**
 * Gets notified of [[System]] related events.
 */
export interface SystemListener {
  /**
	 * Called whenever an [[System]] is added to [[Engine]] or a specific [[Family]] See
	 * {@link Engine#addSystemListener(SystemListener)} and {@link Engine#addSystemListener(Family, SystemListener)}
	 * @param entity
	 */
	systemAdded(system: System): void

	/**
	 * Called whenever an [[System]] is removed from [[Engine]] or a specific [[Family]] See
	 * {@link Engine#addSystemListener(SystemListener)} and {@link Engine#addSystemListener(Family, SystemListener)}
	 * @param entity
	 */
	systemRemoved(system: System): void
}


export class SystemManager {
	private systems: System[] = []
	private systemMap = new WeakMap()
  private listener: SystemListener

  constructor(listener: SystemListener) {
	  this.listener = listener
  }

  public addSystem(system: System): void{
    // TODO check if system already exists, if so replace it
    this.systemMap.set(system.constructor, system)
	  this.systems.push(system)
	  this.systems.sort(this.systemComparator)
	  this.listener.systemAdded(system)
  }

  public removeSystem(system: System): void {
    const i = this.systems.indexOf(system)
    if(i > -1){
		  this.systems.splice(i, 1)
    }
    this.systemMap.delete(system.constructor)
	  this.listener.systemRemoved(system)
  }

  public removeAllSystems(): void {
    // TODO for pooling operations -> not implemented
    // this.systems.forEach((system: System) => {
    //   this.removeSystem(entity)
    // })
    this.systems = []
  }

  public getSystem<T extends System>(systemClass: Klass<T>): T {
    return this.systemMap.get(systemClass)
  }

  public getSystems(): System[] {
	  return this.systems
  }

  private systemComparator(a: System, b: System): number {
    return a.priority > b.priority ? 1 : (a.priority == b.priority) ? 0 : -1
  }

}
