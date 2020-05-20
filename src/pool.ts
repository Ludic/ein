
export interface ObjectPoolFactory<T extends object> {
  (): T
}

const EMPTY_OBJ = Object.freeze(Object.create(null))

export class Pool<T extends object> {

  factory: ObjectPoolFactory<T>
  objects: Array<T>
  index: number = 0

  constructor(factory: ObjectPoolFactory<T>, allocate: number = 20){
    this.factory = factory
    this.objects = []
    this.grow(allocate)
  }

  /**
   * Grow the pool by some length.
   * @param size size to grow the pool by
   */
  grow(size: number){
    for(let i=0; i<size; i++){
      const obj = this.factory()
      this.objects.push(obj)
    }
    // console.trace('grow', size)
  }

  /**
   * Get an object from the pool
   */
  get(): T {
    if(this.available <= 0){
      this.grow(this.objects.length) // double the pool
    }
    const obj = this.objects[this.index]
    this.objects[this.index++] = EMPTY_OBJ
    return obj
  }

  /**
   * Put the object back into the pool
   * @param obj object to free
   */
  free(obj: T){
    this.objects[--this.index] = obj
  }

  get size(){
    return this.objects.length
  }

  get available(){
    return this.size - this.index
  }
}

export default Pool