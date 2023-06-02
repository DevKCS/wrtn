import {addAccount, wrtn} from './wrtn.js';
//console.log(await addAccount("asdfgh@test.com","w"))


let t = new wrtn();
await t.loginByEmail("restrent@gmail.com","test1234!")
console.time()
console.log(t.loginToken)
console.log(await t.ask("안녕?","GPT4.0","646dec85cd7daeafede40b1e"))
let fileId = await t.upload(readFileSync("333.pdf").buffer)
console.log("fileId : "+fileId)
console.log(await t.ask("이 파일의 주요내용을 요약해","GPT3.5","646dec85cd7daeafede40b1e",fileId))
console.log(await t.askWithSearch("오늘 날짜","646dec85cd7daeafede40b1e"))
console.timeEnd()
