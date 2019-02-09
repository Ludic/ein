import Engine from './engine'

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
	public update(deltaTime: number): void {

	}

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



export class SystemManager {
	private systemComparator: SystemComparator  = new SystemComparator()
	private systems: System[] = []
	// private ImmutableArray<EntitySystem> immutableSystems = new ImmutableArray<EntitySystem>(systems);
	private systemsByClass: object = {}
	private listener: SystemListener

	constructor(listener: SystemListener) {
		this.listener = listener
	}

	public addSystem(system: System): void{
    // TODO check if system already exists, if so replace it
		// const systemType: string = system.
		// EntitySystem oldSytem = getSystem(systemType);

		// if (oldSytem != null) {
		// 	removeSystem(oldSytem);
		// }

    // TODO
		this.systems.push(system)
		// systemsByClass.put(systemType, system);
		this.systems.sort(systemComparator)
		this.listener.systemAdded(system)
	}

	public void removeSystem(EntitySystem system){
		if(systems.removeValue(system, true)) {
			systemsByClass.remove(system.getClass());
			listener.systemRemoved(system);
		}
	}

	public void removeAllSystems() {
		while(systems.size > 0) {
			removeSystem(systems.first());
		}
	}

	@SuppressWarnings("unchecked")
	public <T extends EntitySystem> T getSystem(Class<T> systemType) {
		return (T) systemsByClass.get(systemType);
	}

	public ImmutableArray<EntitySystem> getSystems() {
		return immutableSystems;
	}

	private static class SystemComparator implements Comparator<EntitySystem>{
		@Override
		public int compare(EntitySystem a, EntitySystem b) {
			return a.priority > b.priority ? 1 : (a.priority == b.priority) ? 0 : -1;
		}
	}

	interface SystemListener {
		systemAdded(system: EntitySystem): void
		void systemRemoved(EntitySystem system)
	}
}
