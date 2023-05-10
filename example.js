import {addAccount, wrtn} from './wrtn.js';
console.log(await addAccount("asdfgh@test.com","w"))


let t = new wrtn();
await t.loginByEmail("wrtntest02@ruu.kr","w")
console.time()
console.log(t.loginToken)
console.log(await t.roomList())
console.log(await t.refresh())
//console.log(await t.removeRoom('645b69e6ac512fd38c1c5288'))
console.log(await t.roomList())
console.timeEnd()