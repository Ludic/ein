import Signal from './signal'
import Listener from './listener'
import Component from './component'

/**
 * Simple containers of {@link Component}s that give them "data". The component's data is then processed by {@link EntitySystem}s.
 */
export class Entity {
  /** A flag that can be used to bit mask this entity. Up to the user to manage. */
	flags: number
	/** Will dispatch an event when a component is added. */
	componentAdded: Signal<Entity>
	/** Will dispatch an event when a component is removed. */
  componentRemoved: Signal<Entity>

  scheduledForRemoval: boolean
	removing: boolean

	private components: Component[]

  constructor(){
    this.components = []

    this.componentAdded = new Signal<Entity>()
    this.componentRemoved = new Signal<Entity>()
  }
}


/**
 * Gets notified of {@link Entity} related events.
 */
export interface EntityListener {
	/**
	 * Called whenever an {@link Entity} is added to {@link Engine} or a specific {@link Family} See
	 * {@link Engine#addEntityListener(EntityListener)} and {@link Engine#addEntityListener(Family, EntityListener)}
	 * @param entity
	 */
	entityAdded(entity: Entity): void

	/**
	 * Called whenever an {@link Entity} is removed from {@link Engine} or a specific {@link Family} See
	 * {@link Engine#addEntityListener(EntityListener)} and {@link Engine#addEntityListener(Family, EntityListener)}
	 * @param entity
	 */
	entityRemoved(entity: Entity): void
}


/**
 * Manages the addition / removal of entity
 * TODO, ashly has a concept of delaying / pooling operations
 **/
export class EntityManager {
	private listener: EntityListener
	private entities: Entity[] = []
	// private ObjectSet<Entity> entitySet = new ObjectSet<Entity>();
	// private ImmutableArray<Entity> immutableEntities = new ImmutableArray<Entity>(entities);
	// private Array<EntityOperation> pendingOperations = new Array<EntityOperation>(false, 16);
	// private EntityOperationPool entityOperationPool = new EntityOperationPool();

	constructor(listener: EntityListener) {
		this.listener = listener
	}

	public addEntity(entity: Entity): void {

    // TODO
		// if (entitySet.contains(entity)) {
		// 	throw new IllegalArgumentException("Entity is already registered " + entity);
		// }

		this.entities.push(entity)
		this.listener.entityAdded(entity)
	}

	public removeEntity(entity: Entity): void {
		entity.removing = true
    const i = this.entities.indexOf(entity)
    if(i > -1){
		  this.entities.splice(i, 1)
    }
		this.listener.entityRemoved(entity)
		entity.removing = false
	}

	public removeAllEntities(): void {
    // TODO for pooling operations -> not implemented
    // this.entities.forEach((entity: Entity) => {
    //   this.removeEntity(entity)
    // })
    this.entities = []
	}
}
