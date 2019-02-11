import { Engine } from './engine'

/**
 * Abstract class for processing sets of {@link Entity} objects.
 */
export abstract class System {
	/** Use this to set the priority of the system. Lower means it'll get executed first. */
	public priority: number

	private processing: boolean
	private engine: Engine | null

	/**
	 * Initialises the EntitySystem with the priority specified.
	 * @param priority The priority to execute this system with (lower means higher priority).
	 */
	constructor(priority: number = 0){
		this.priority = priority
		this.processing = true
	}

	/**
	 * Called when this EntitySystem is added to an {@link Engine}.
	 * @param engine The {@link Engine} this system was added to.
	 */
	public addedToEngine(engine: Engine): void {

  }

	/**
	 * Called when this EntitySystem is removed from an {@link Engine}.
	 * @param engine The {@link Engine} the system was removed from.
	 */
	public removedFromEngine(engine: Engine): void {

	}

	/**
	 * The update method called every tick.
	 * @param deltaTime The time passed since last frame in seconds.
	 */
	public update(deltaTime: number): void {}

	/** @return Whether or not the system should be processed. */
	public checkProcessing(): boolean {
		return this.processing
	}

	/** Sets whether or not the system should be processed by the {@link Engine}. */
	public setProcessing(processing: boolean): void {
		this.processing = processing
	}

	/** @return engine instance the system is registered to.
	 * It will be null if the system is not associated to any engine instance. */
	public getEngine(): Engine | null {
		return this.engine
	}

	addedToEngineInternal(engine: Engine): void {
		this.engine = engine
		this.addedToEngine(engine)
	}

	removedFromEngineInternal(engine: Engine): void {
		this.engine = null
		this.removedFromEngine(engine)
	}
}


/**
 * Gets notified of {@link System} related events.
 */
export interface SystemListener {
  /**
	 * Called whenever an {@link System} is added to {@link Engine} or a specific {@link Family} See
	 * {@link Engine#addSystemListener(SystemListener)} and {@link Engine#addSystemListener(Family, SystemListener)}
	 * @param entity
	 */
	systemAdded(system: System): void

	/**
	 * Called whenever an {@link System} is removed from {@link Engine} or a specific {@link Family} See
	 * {@link Engine#addSystemListener(SystemListener)} and {@link Engine#addSystemListener(Family, SystemListener)}
	 * @param entity
	 */
	systemRemoved(system: System): void
}


export class SystemManager {
	private systems: System[] = []
	private systemsByClass: object = {}
	private listener: SystemListener

  // TODO not using these
  // private systemComparator: SystemComparator  = new SystemComparator()
	// private ImmutableArray<System> immutableSystems = new ImmutableArray<System>(systems)

	constructor(listener: SystemListener) {
		this.listener = listener
	}

	public addSystem(system: System): void{
    // TODO check if system already exists, if so replace it
		// const systemType: string =
		// System oldSytem = getSystem(systemType)
		// if (oldSytem != null) {
		// 	removeSystem(oldSytem)
		// }

    // TODO
    // systemsByClass.put(systemType, system);

		this.systems.push(system)
		this.systems.sort(this.systemComparator)
		this.listener.systemAdded(system)
	}

	public removeSystem(system: System): void {
    const i = this.systems.indexOf(system)
    if(i > -1){
		  this.systems.splice(i, 1)
    }
		this.listener.systemRemoved(system)
	}

	public removeAllSystems(): void {
    // TODO for pooling operations -> not implemented
    // this.systems.forEach((system: System) => {
    //   this.removeSystem(entity)
    // })
    this.systems = []
	}

	// public getSystem(systemType: <T>):  <T extends System> T  {
	// 	return (T) systemsByClass.get(systemType);
	// }

	public getSystems(): System[] {
		return this.systems
	}

	private systemComparator(a: System, b: System): number {
    return a.priority > b.priority ? 1 : (a.priority == b.priority) ? 0 : -1
	}

}
