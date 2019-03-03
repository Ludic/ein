import Entity from './Entity'

// Get notified of [[Entity]] related events.
export default interface EntityListener {
	/**
	 * Called whenever an [[Entity]] is added to {@link Engine} or a specific {@link Family} See
	 * {@link Engine#addEntityListener(EntityListener)} and {@link Engine#addEntityListener(Family, EntityListener)}
	 * @param entity
	 */
  entityAdded(entity: Entity): void

  /**
   * Called whenever an [[Entity]] is removed from {@link Engine} or a specific {@link Family} See
   * {@link Engine#addEntityListener(EntityListener)} and {@link Engine#addEntityListener(Family, EntityListener)}
   * @param entity
   */
  entityRemoved(entity: Entity): void
}
