export default class BaseSystem {
  constructor(active = true, priority = -1, updateFunction){
    this.active = active;
    this.priority = priority;
    this.updateFunction = updateFunction;
    this.entities = [];
  }

  //Overide
  onEntityAdded(manager){}

  onEntityRemoved(manager){}

  //Overide
  update(){
    if(this.updateFunction){
      this.updateFunction();
    }
  }
};
