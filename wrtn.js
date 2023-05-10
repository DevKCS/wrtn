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
     * @param {"요약"|"유의어대체"|"서론"|"본론"|"유튜브제목"|"유튜브설명"|"유튜브타임라인"|"유튜브시나리오"|"유튜브숏츠"|"유튜브목차"|"레포트목차"|"레포트서론"|"레포트본론"|"레포트결론"|"블로그작성"|"댓글답변"|"창업아이디어"|"음식소개"} toolName 
     * @returns {Promise<String>}
    */
    async tool(question, toolName) {
        let tool = {
            "요약" : "634d052b2f219e52e4d168ba", //글을 요약해줍니다.
            "유의어대체": "62fcca9f9bc6216afc166125", //단어를 입력하면 비슷한 의미의 단어로 대체해줍니다.
            "서론": "62fb768577ba1530712e7434", //주제를 입력하면 서론을 작성해줍니다.
            "본론": "63031912761523758a7f4436", //주제를 입력하면 본론을 작성해줍니다
            "유튜브제목": "636c5a189a81670e5192f458", //주제를 입력하면 유튜브 제목을 작성해줍니다.
            "유튜브설명": "636c5f05f846e2aa5c100430", //주제를 입력하면 유튜브 설명을 작성해줍니다.
            "유튜브타임라인": "636c601adac8675d61ea9c7a", //주제를 입력하면 유튜브 타임라인/설명을 작성해줍니다.
            "유튜브시나리오": "636c64b02e874093ae83b23f", //소재를 입력하면 유튜브 주제/시나리오을 작성해줍니다.
            "유튜브숏츠": "6412d6dc1303f7d56aa62b9a", //주제를 입력하면 유튜브 숏츠 대본을 작성해줍니다.
            "레포트목차": "6412b907270278c8665625cf", //주제를 입력하면 레포트 목차를 작성해줍니다.
            "레포트서론": "6412b9b1523f70691c36a74a", //주제를 입력하면 레포트 서론을 작성해줍니다.
            "레포트본론": "6412bac49e6800c993d24848", //주제를 입력하면 레포트 본론을 작성해줍니다.
            "레포트결론": "6412ba4488ec311b00c2b39a", //주제를 입력하면 레포트 결론을 작성해줍니다.
            "블로그작성": "63b2b5587b66829fa8483b89", //주제를 입력하면 블로그의 내용을 작성해줍니다.
            "댓글답변": "636c9292fb58cf055a87f6cb", //댓글을 입력하면 댓글에 알맞는 답변을 작성해줍니다.
            "창업아이디어": "62fb6fb077ba1530712e7382", //관심 분야를 입력하면 관심 분야에 알맞는 창업 아이디어를 작성해줍니다.
            "음식소개": "62fb5ee50a234c105d03c66c", //음식 이름을 입력하면 음식 소개글을 작성해줍니다.
        }
        if (this.loginToken == undefined) throw new Error("Login failed.")
        if(!(toolName in tool)) throw new Error("No toolName was found.")
        try {
            const response = await axios.post('https://gen-api-prod.wrtn.ai/generate/tool/'+tool[toolName], {
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