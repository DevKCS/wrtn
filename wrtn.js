import axios from "axios";

export class wrtn {
    constructor(access_token, refresh_token) {
        this.access_token = access_token;
        this.refresh_token = refresh_token;
    }
    /**
     * @returns {Promise<Boolean>} 로그인을 시도합니다.
     */
    async Login() {
        try {
            const response = await axios.get("https://wrtn.ai/", {
                headers: {
                    cookie: "refresh_token=" + this.refresh_token + "; access_token=" + this.access_token,
                },
            });
            let data = JSON.parse(
                response.data.slice(
                    response.data.indexOf(`<script id="__NEXT_DATA__" type="application/json">`) + 51,
                    response.data.indexOf("</script></body></html>")
                )
            );
            this.loginToken = data.props.pageProps.accessKey;
            return true;
        } catch (e) {
            throw new Error("Login failed.")
        }
    }
    /**
     * @param email 사용자의 이메일
     * @param password 사용자의 비밀번호
     * @returns {Promise<boolean>} 로그인 성공 여부
     */
    async loginByEmail(email,password) {
        try {
            const response = await axios.post("https://api.wow.wrtn.ai/auth/local", {
                email: email,
                password: password
            }, {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
                    "authorization": "Bearer undefined",
                    "content-type": "application/json",
                    "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "Referer": "https://wrtn.ai/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
            });
            this.access_token = response.data.data.accessToken;
            this.refresh_token = response.data.data.refreshToken;
            await this.Login();
            return true;
        } catch (e) {
            throw new Error("Login failed.")
        }
    }
    /**
     * @returns {Promise<Boolean>} 토큰 갱신을 시도합니다.
     */
    async refresh() {
        try {
            const response = await axios.post("https://api.wow.wrtn.ai/auth/refresh", {},{
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
                    "content-type": "application/x-www-form-urlencoded",
                    "refresh": this.refresh_token,
                    "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
                    "sec-ch-ua-mobile": "?0",
                    "sec-ch-ua-platform": "\"Windows\"",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site",
                    "Referer": "https://wrtn.ai/",
                    "Referrer-Policy": "strict-origin-when-cross-origin"
                },
            });
            this.loginToken = response.data.data.accessToken;
            return true;
        } catch (e) {
            throw new Error("Login failed.")
        }
    }

    /**
     * @returns {Promise<String>} 방 ID를 반환합니다.
     */
    async addRoom() {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = (await axios.post("https://api.wrtn.ai/chat", null, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5',
                    'authorization': 'Bearer ' + this.loginToken,
                    'sec-ch-ua': '"Chromium";v="112", "Google Chrome";v="112", "Not:A-Brand";v="99"',
                    'sec-ch-ua-mobile': '?0',
                    'sec-ch-ua-platform': '"Windows"',
                    'sec-fetch-dest': 'empty',
                    'sec-fetch-mode': 'cors',
                    'sec-fetch-site': 'same-site',
                    'Referer': 'https://wrtn.ai/',
                    'Referrer-Policy': 'strict-origin-when-cross-origin'
                }
            })).data
            return response.data._id
        } catch (e) {
            throw new Error("Login failed.\n" + e)
        }
    }
    /**
     * @returns {Promise<Array>} 존재하는 방 ID를 반환합니다.
     */
    async roomList() {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = await axios.get("https://api.wrtn.ai/chat", {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': "Bearer " + this.loginToken,
                },
            });
            let roomList = response.data.data.map((e) => {
                return {
                    id: e._id,
                    topic: e.topic
                }
            })
            return roomList
        } catch (e) {
            throw new Error("Login failed.")
        }
    }
    /**
     * 
     * @param {String} roomId 삭제할 방 ID
     * @returns {Promise<boolean>} 삭제 성공여부를 반환합니다.
     */
    async removeRoom(roomId) {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = await axios.delete("https://api.wrtn.ai/chat/" + roomId, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': "Bearer " + this.loginToken,
                },
            })
            if (response.statusText != "OK") return false;
            return true
        } catch (e) {
            throw new Error("Login failed.")
        }
    }
    /**
     * 
     * @param {String} question 질문 내용
     * @param {"GPT3.5"|"GPT4.0"} type 답변할 언어 모델
     * @param {String} roomId 방 ID
     * @returns {Promise<String>} 질문의 답변을 반환합니다.
     */
    async ask(question, type, roomId) {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = await axios.post('https://gen-api-prod.wrtn.ai/generate/stream/' + roomId + '?type=big&model=' + (type == "GPT4.0" ? "GPT4" : "GPT3.5"), {
                message: question.replace(/그려줘/gi, "그려.줘").replace(/draw/gi, "dra.w"),
                reroll: false
            }, {
                headers: {
                    'Authorization': 'Bearer ' + this.loginToken,
                    'Content-Type': 'application/json'
                }
            });
            let arr = response.data.trim().split('\n\n')
            arr.shift();
            return arr.map(e => {
                const data = e.split('\n')[1].match(/data: (.*)/s)

                if (data === null) throw new Error("No roomId was found.")

                const raw = JSON.parse(data[1])

                return raw.chunk;
            }).join('')
        } catch (e) {
            throw new Error("No roomId was found.")
        }
    }
    /**
     * @param {"GPT3.5"|"GPT4.0"} type 답변할 언어 모델
     * @param {String} roomId 방 ID
     * @returns {Promise<String>} 질문의 답변을 반환합니다.
     */
    async reAsk(type,roomId) {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = await axios.post('https://gen-api-prod.wrtn.ai/generate/stream/' + roomId + '?type=mini&model=' + (type == "GPT4.0" ? "GPT4" : "GPT3.5"), {
                reroll: true,
                message:""
            }, {
                headers: {
                    'Authorization': 'Bearer ' + this.loginToken,
                    'Content-Type': 'application/json'
                },
            });
            let arr = response.data.trim().split('\n\n')
            arr.shift();
            return arr.map(e => {
                const data = e.split('\n')[1].match(/data: (.*)/s)

                if (data === null) throw new Error("No roomId was found.")

                const raw = JSON.parse(data[1])

                return raw.chunk;
            }).join('')
        } catch (e) {
            throw new Error("No roomId was found.")
        }
    }
    /**
     * 
     * @param {String} prompt 그림을 그릴 키워드
     * @param {String} roomId 방 ID
     * @returns {Promise<Array>} 생성된 그림 링크 4개를 반환합니다.
     */
    async art(prompt, roomId) {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = await axios.post('https://gen-api-prod.wrtn.ai/generate/stream/' + roomId + '?type=big&model=GPT4', {
                message: prompt + " 그려줘",
                reroll: false
            }, {
                headers: {
                    'Authorization': 'Bearer ' + this.loginToken,
                    'Content-Type': 'application/json'
                },
                responseType: 'stream'
            });

            let data = '';
            response.data.on('data', (chunk) => {
                chunk = chunk.toString();
                if (chunk.includes("imageUrls")) {
                    data = (chunk.slice(chunk.indexOf(`"imageUrls":`) + 12, chunk.indexOf(`"liked":false}]}}`) + 15));
                }
            });

            return new Promise((resolve, reject) => {
                response.data.on('end', () => {
                    resolve(JSON.parse(data).map((e) => {
                        return e.url
                    }));
                });
                response.data.on('error', (err) => {
                    reject(err);
                });
            });
        } catch (e) {
            throw new Error("No roomId was found.")
        }
    }
    /**
     * @param {String} question
     * @param {String} toolName
     * @returns {Promise<String>}
    */
    async tool(question, toolId) {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        let tool = (await axios.get('https://api.wow.wrtn.ai/tool', {
            headers: {
                'Authorization': 'Bearer ' + this.loginToken,
                'Content-Type': 'application/json'
            }
        })).data.data.map((e) => {
            return {id:e._id,name:e.name}
        })
        if(!(tool.some(obj => obj["id"] === toolId))) throw new Error("No toolName was found.")
        try {
            const response = await axios.post('https://gen-api-prod.wrtn.ai/generate/tool/'+toolId, {
                "inputs": [
                  question
                ],
                "options": []
              }, {
                headers: {
                    'Authorization': 'Bearer ' + this.loginToken,
                    'Content-Type': 'application/json'
                }
            });
            return response.data.data.originOutput
        } catch (e) {
            throw new Error("Login failed.")
        }
    }

    /**
     * @return 툴 목록을 반환
     */
    async toolList() {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        let tool = (await axios.get('https://api.wow.wrtn.ai/tool', {
            headers: {
                'Authorization': 'Bearer ' + this.loginToken,
                'Content-Type': 'application/json'
            }
        })).data.data.map((e) => {
            return {id:e._id,name:e.name}
        })
        return tool
    }
}

function generateGAClientId() {
    var timestamp = Math.floor(Date.now() / 1000);
    var randomNumber = Math.floor(Math.random() * 10000000000);
    var clientId = "GA1.1." + randomNumber + "." + timestamp; // 클라이언트 ID 문자열 생성
    return clientId;
}
export async function addAccount(email, password) {
    try {
        const emailCheck = (await axios.get('https://api.wow.wrtn.ai/auth/check?email=' + email,{
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
                "authorization": "Bearer undefined",
                "content-type": "application/json",
                "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://wrtn.ai/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }

        })).data
        if (emailCheck.result != "SUCCESS") throw new Error("Email already exists.")
        if (emailCheck.data != null) throw new Error("Email already exists.")

        const response = await axios.post('https://api.wow.wrtn.ai/auth/register?deviceId='+generateGAClientId(), {
            email: email,
            password: password,
        }, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "accept-language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,zh-CN;q=0.6,zh;q=0.5",
                "authorization": "Bearer undefined",
                "content-type": "application/json",
                "sec-ch-ua": "\"Chromium\";v=\"112\", \"Google Chrome\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "Referer": "https://wrtn.ai/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            }
        });

        return response.data
    } catch (e) {
        throw new Error("Unknown error."+e)
    }
}