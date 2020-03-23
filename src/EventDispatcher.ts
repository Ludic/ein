import { Component } from "./Component"
import { Entity } from "./Entity"

export class EventDispatcher {
  listeners: {[key:string]: any[]}

  constructor() {
    this.listeners = {}
  }

  /**
   * Add an event listener
   * @param {String} eventName Name of the event to listen
   * @param {Function} listener Callback to trigger when the event is fired
   */
  addEventListener(eventName: string, listener: ()=>void){
    if(this.listeners[eventName] === undefined){
      this.listeners[eventName] = []
    }

    if(!this.listeners[eventName].includes(listener)){
      this.listeners[eventName].push(listener)
    }
  }

  /**
   * Check if an event listener is already added to the list of listeners
   * @param {String} eventName Name of the event to check
   * @param {Function} listener Callback for the specified event
   */
  hasEventListener(eventName: string, listener: ()=>void) {
    return (
      this.listeners[eventName] !== undefined &&
      this.listeners[eventName].includes(listener)
    )
  }

  /**
   * Remove an event listener
   * @param {String} eventName Name of the event to remove
   * @param {Function} listener Callback for the specified event
   */
  removeEventListener(eventName: string, listener: ()=>void) {
    let listeners = this.listeners[eventName]
    if(listeners !== undefined){
      var index = listeners.indexOf(listener)
      if(index !== -1){
        listeners.splice(index, 1)
      }
    }
  }

  /**
   * Dispatch an event
   * @param {String} eventName Name of the event to dispatch
   * @param {Entity} entity (Optional) Entity to emit
   * @param {Component} component
   */
  dispatchEvent(eventName: string, entity?: Entity, component?: Component) {
    let listeners = this.listeners[eventName]
    if(listeners !== undefined){
      var array = listeners.slice(0)
      for(let i = 0; i < array.length; i++) {
        array[i].call(this, entity, component)
      }
    }
  }
}
