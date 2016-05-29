export default class BaseEntity {
  constructor(active = true, priority = -1){
    this.active = active;
    this.priority = priority;
    this.needsDestroy = false;
  }
};
