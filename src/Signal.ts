import Listener from './Listener'

export default class Signal<T> {
  private listeners: Listener<T>[]

  constructor(){
    this.listeners = []
  }

	/**
	 * Add a Listener to this Signal
	 * @param listener The Listener to be added
	 */
	public add(listener: Listener<T>): void {
		this.listeners.push(listener)
	}

	/**
	 * Remove a listener from this Signal
	 * @param listener The Listener to remove
	 */
	public remove(listener: Listener<T>): void {
		this.listeners.splice(this.listeners.indexOf(listener), 1)
	}

	/** Removes all listeners attached to this {@link Signal}. */
	public removeAllListeners(): void {
		this.listeners = []
	}

	/**
	 * Dispatches an event to all Listeners registered to this Signal
	 * @param data The object to send off
	 */
	public dispatch(data: T): void {
    this.listeners.forEach((listener: Listener<T>) => {
      listener.receive(this, data)
    })
	}
}
