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
      console.warn("EntityManager.addEntity(): Attempted to add an Entity with an existing _id ");
      return false;
    } else {
      entity._id = this.nextEntityId++;
      this.entities.push(entity);

      //Notify Systems EntityAdded
      this.systems.forEach(system => {
        system.onEntityAdded(this);
      });
      return true;
    }
  }

  removeEntity(entity){
    let index = this.entities.indexOf(entity);
    if(index > -1){
      this.entities.splice(index, 1);

      this.systems.forEach(system => {
        system.onEntityRemoved(this);
      });
      return true;
    } else {
      console.warn("EntityManager.removeEntity(): Attempted to remove an Entity not in this.entities");
      return false;
    }
  }

  getEnityById(id){
    this.entities.forEach(entity => {
      if(entity._id === id){
        return entity;
      }
    });
    console.warn("EntityManager.getEnityById(): Attempted to get an Entity not in this.entities");
  }

  getEntitiesByProps(props){
    let entities = [];
    this.entities.forEach(entity => {
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

      if(hasAllProps){
        entities.push(entity);
      }
    });
    return entities;
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
      console.warn("EntityManager.addSystem(): Attempted to add a System with an existing _id ");
      return false;
    } else {
      system._id = this.nextSystemId++;
      this.systems.push(system);
      system.onSystemAddedTo(this);
      this._sortSystems();
      return true;
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
      console.warn("EntityManager.removeSystem(): Attempted to remove a System not in this.systems");
      return false;
    }
  }

  _sortSystems(){
    this.systems.sort((a,b) => (a.priority - b.priority));
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
