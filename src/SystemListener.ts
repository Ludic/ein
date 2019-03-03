import System from './System'

/**
 * Gets notified of [[System]] related events.
 */
export default interface SystemListener {
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
