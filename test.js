const refresh_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NTc5ZGFkNmUyZDdhZDZjZGI4OWNjZCIsImlhdCI6MTY4MzU0NDkyNiwiZXhwIjoxNjg0MTQ5NzI2fQ.vZbdjufwMcwuTSB5m4c1n4_CsTCU4e3ZoM4KEHcgWWY"
const access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NTc5ZGFkNmUyZDdhZDZjZGI4OWNjZCIsImVtYWlsIjoia2ltMzgzNDAwMHBAZ21haWwuY29tIiwicHJvdmlkZXIiOiJnb29nbGUiLCJpYXQiOjE2ODM1NDQ5MjYsImV4cCI6MTY4MzU0ODUyNn0.nTNwa8bLQNw7c2asbFJsCEpTc1rp9_4X9GTz0jIvTlI"
import {addAccount, wrtn} from './wrtn.js';
//console.log(await addAccount("wrtntest02@ruu.kr","w"))


let t = new wrtn();
await t.loginByEmail("wrtntest02@ruu.kr","w")
console.time()
console.log(t.loginToken)
console.log(await t.ask("안녕","GPT3.5",'645b69e6ac512fd38c1c5288'))
console.timeEnd()