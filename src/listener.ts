import Signal from './signal'

/**
 * A simple Listener interface used to listen to a {@link Signal}.
 */
export default interface Listener<T>{
  /**
	 * @param signal The Signal that triggered event
	 * @param object The object passed on dispatch
	 */
	receive(signal: Signal<T>, T: object): void
}
