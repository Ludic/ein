export default class EntityManager {
  constructor(){
    this.entities = [];
    this.systems = [];
    this.listeners = {};
    this.nextEntityId = 0;
    this.nextSystemId = 0;
  }

  /* Entities */
  addEntity(entity){
    if(entity.hasOwnProperty("_id")){
      return false;
    } else {
      entity._id = this.nextEntityId++;
      this.entities.push(entity);

      //Notify Systems that an Entity was Added
      this.systems.forEach(system => {
        system.onEntityAdded(entity);
      });
      return entity;
    }
  }

  removeEntity(entity){
    let index = this.entities.indexOf(entity);
    if(index > -1){
      this.entities.splice(index, 1);

      this.systems.forEach(system => {
        system.onEntityRemoved(entity);
      });
      return true;
    } else {
      return false;
    }
  }

  getEntityById(id){
    let found = false;
    this.entities.forEach(entity => {
      if(entity._id === id){
        found = entity;
      }
    });
    return found;
  }

  getEntitiesByProps(props){
    return this.entities.filter(entity => {
      let hasAllProps = true;
      props.forEach(prop => {
        if(typeof prop === 'object'){
          if(!entity.hasOwnProperty(prop.name) || entity[prop.name] !== prop.value){
            hasAllProps = false;
          }
        } else if(typeof prop === 'string'){
          if(!entity.hasOwnProperty(prop)){
            hasAllProps = false;
          }
        }
      });
      return hasAllProps;
    });
  }

  getEntitiesByClassName(className){
    let entities = [];
    this.entities.forEach(entity => {
      if(entity.constructor.name === className){
        entities.push(entity);
      }
    });
    return entities;
  }

  /* Systems */
  addSystem(system){
    if(system.hasOwnProperty("_id")){
      return false;
    } else {
      system._id = this.nextSystemId++;
      this.systems.push(system);
      system.onSystemAddedTo(this);
      this._sortSystems();
      return system;
    }
  }

  removeSystem(system){
    let index = this.systems.indexOf(system);
    if(index > -1){
      this.systems.splice(index, 1);
      system.onSystemRemovedFrom(this);
      this._sortSystems();
      return true;
    } else {
      return false;
    }
  }

  getSystemById(id){
    let found = false;
    this.systems.forEach(system => {
      if(system._id === id){
        found = system;
      }
    });
    return found;
  }


  _sortSystems(){
    this.systems.sort((a,b) => {
      let prio = (a.priority - b.priority)
      if(prio === 0){
        // if systems have the same priority, sort by _id
        return (a._id - b._id)
      }
      return prio
    });
  }

  /* Events */
  listenFor(eventName, listener, binder){
    let group = this.listeners[eventName];
    if(!group){
      group = [];
      this.listeners[eventName] = group;
    }

    let l = {};
    l.eventName = eventName;
    l.listener = listener;
    l.binder = binder;

    group.push(l);
  }

  notify(eventName){
    let group = this.listeners[eventName];
    if(group){
      group.forEach((l)=>{
        if('binder' in l){
          l.listener.apply(l.binder,arguments);
        } else {
          l.listener.apply(l.listener, arguments);
        }
      });
    }
  }

  removeListener(eventName, listener){
    let group = this.listeners[eventName];

    if(group){
      for(let ix in group){
        let l = group[ix];
        if(l.listener===listener){
          group.splice(ix,1);
          break;
        }
      }
    }
  }

  //Update
  update(delta){
    //Update all active systems
    this.systems.forEach(system => {
      if(system.active){
        system.update(delta, this);
      }
    });
  }
};
