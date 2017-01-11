const DEFAULTS = {
  active: true,
  priority: -1,
}
export default class BaseSystem {
  constructor(active = DEFAULTS.active, priority = DEFAULTS.priority, updateFunction){
    if(typeof active === 'object'){
      // process options object if passed as first arg
      this.options = Object.assign(DEFAULTS, active)
    } else {
      this.options = {
        active,
        priority,
        update: updateFunction
      }
    }
    // assign all options to this object
    for(let prop in this.options){
      let val = this.options[prop];
      this[prop] = typeof val === 'function' ? val.bind(this) : val;
    }
    this.entities = [];
  }

  //Overide
  onEntityAdded(manager){}

  onEntityRemoved(manager){}

  onSystemAddedTo(manager){
    this.em = manager;
  }

  onSystemRemovedFrom(manager){}

  //Overide
  update(...args){}
};
