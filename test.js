const refresh_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NTc5ZGFkNmUyZDdhZDZjZGI4OWNjZCIsImlhdCI6MTY4MzU0NDkyNiwiZXhwIjoxNjg0MTQ5NzI2fQ.vZbdjufwMcwuTSB5m4c1n4_CsTCU4e3ZoM4KEHcgWWY"
const access_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY0NTc5ZGFkNmUyZDdhZDZjZGI4OWNjZCIsImVtYWlsIjoia2ltMzgzNDAwMHBAZ21haWwuY29tIiwicHJvdmlkZXIiOiJnb29nbGUiLCJpYXQiOjE2ODM1NDQ5MjYsImV4cCI6MTY4MzU0ODUyNn0.nTNwa8bLQNw7c2asbFJsCEpTc1rp9_4X9GTz0jIvTlI"
import { editor, wrtn } from './wrtn.js';
let t = new editor(access_token, refresh_token);
await t.Login()
console.time()
console.log(t.loginToken)
console.log(await t.generate('6458dcfd48bb9150785726ea'))
console.timeEnd()