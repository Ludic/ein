export default class BaseEvent {
  constructor(active = true, priority = -1){
    this.active = active;
    this.priority = priority;
  }

  //Overide
  onEntityAdded(manager){
    console.info("BaseSystem.onEntityAdded()");
  }

  onEntityRemoved(manager){
    console.info("BaseSystem.onEntityRemoved()");
  }
};
