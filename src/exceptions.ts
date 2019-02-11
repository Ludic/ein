export class EinException extends Error {
  name: string = "EinException"

  constructor(message: string){
    super(message)
  }
}

export class IllegalStateException extends EinException{
  name: string = "IllegalStateException"

  constructor(message: string){
    super(message)
  }
}
