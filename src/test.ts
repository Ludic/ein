import { TransferableComponent } from './TransferableComponent'

class HealthComponent extends TransferableComponent {
  constructor(value: number){
    super(value)
  }
}


let t: HealthComponent = new HealthComponent(5)


// console.log("t:", t)
// console.log("data: ", t.data)
// console.log("transferable: ", t.transferable_data)

console.log("from: ", t.fromTransferable(t.transferable_data))
