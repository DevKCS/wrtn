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
                },
                responseType: 'stream'
            });

            let data = '';
            response.data.on('data', (chunk) => {
                chunk = chunk.toString();
                if (chunk.includes("message")) {
                    data += (chunk.slice(chunk.indexOf(`"chunk":"`) + 9, chunk.indexOf(`","ms"`)));
                }
            });

            return new Promise((resolve, reject) => {
                response.data.on('end', () => {
                    if (data == "") throw new Error("No roomId was found.")
                    resolve(data);
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
                responseType: 'stream'
            });

            let data = '';
            response.data.on('data', (chunk) => {
                chunk = chunk.toString();
                if (chunk.includes("message") && chunk.includes("chunk")){
                    data += (chunk.slice(chunk.indexOf(`"chunk":"`) + 9, chunk.indexOf(`","ms"`)));
                }
            });

            return new Promise((resolve, reject) => {
                response.data.on('end', () => {
                    if (data == "") throw new Error("No roomId was found.")
                    resolve(data);
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
export class editor {
    constructor(access_token, refresh_token) {
        this.access_token = access_token;
        this.refresh_token = refresh_token;
    }
    /**
     * @returns {Promise<Boolean>>} 로그인을 시도합니다.
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
    async roomList() {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = await axios.get("https://api.wrtn.ai/doc?page=1&limit=100", {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': "Bearer " + this.loginToken,
                },
            });
            let roomList = response.data.data.map((e) => {
                return {
                    id: e._id,
                    title:e.title,
                    topic: e.topic
                }
            })
            return roomList
        } catch (e) {
            throw new Error("Login failed.")
        }
    }
    async addRoom(title,topic) {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = (await axios.post("https://api.wrtn.ai/doc", null, {
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
            }))
            if (response.status == 201) {
                await this.setTitle(title, response.data.data._id)
                await this.setTopic(topic, response.data.data._id)
                return response.data.data._id;
            }
            throw new Error("Login failed.")
        }
         catch (e) {
            throw new Error("Login failed.")
        }
    }
    async setTopic(topic, roomId) {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = await axios.put("https://api.wrtn.ai/doc/"+roomId,{
                "topic": topic,
                "category": "선택 안 함",
                "connect": "선택_안함"
            }, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': "Bearer " + this.loginToken,
                },
            });
            if(response.status == 200) return true;
            else return false;
        } catch (e) {
            throw new Error("No roomId was found.")
        }
    }
    async setTitle(title, roomId) {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            const response = await axios.put("https://api.wrtn.ai/doc/"+roomId,{
                title:title
            }, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': "Bearer " + this.loginToken,
                },
            });
            if(response.status == 200) return true;
            else return false;
        } catch (e) {
            throw new Error("No roomId was found.")
        }
    }
    async generate(roomId) {
        if (this.loginToken == undefined) throw new Error("Login failed.")
        try {
            let dat = (await axios.get("https://api.wrtn.ai/doc/"+roomId, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': "Bearer " + this.loginToken,
                },
            })).data;
            let content = dat.data.content;
            const response = await axios.post("https://gen-api-prod.wrtn.ai/generate/editor",{
                "inputs": [
                    dat.data.topic,
                    "선택 안 함",
                    content.root.children[0].children[content.root.children[0].children.length-2]?.text == undefined ? content.root.children[0].children[0].text : content.root.children[0].children[content.root.children[0].children.length-2].text
                ],
                "connect": "선택 안 함",
                "docId": roomId,
                "command": "이어쓰기"
            }, {
                headers: {
                    'accept': 'application/json, text/plain, */*',
                    'authorization': "Bearer " + this.loginToken,
                },
            });
            if(response.status == 201) {
                content.root.children[0].children[content.root.children[0].children.length-2]?.type == undefined ? content.root.children[0].children[0].type : content.root.children[0].children[content.root.children[0].children.length-2].type = "text"
                if(content.root.children[0].children.length >= 2) content.root.children[0].children.pop()
                content.root.children[0].children.push({
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": response.data.data.output,
                    "type": "HighlightText",
                    "version": 1,
                    "className": "WrtnEditor_highlightText"
                })
                content.root.children[0].children.push({
                    "detail": 0,
                    "format": 0,
                    "mode": "normal",
                    "style": "",
                    "text": " ",
                    "type": "text",
                    "version": 1
                })
                await axios.put("https://api.wrtn.ai/doc/"+roomId,{content:content}, {
                    headers: {
                        'accept': 'application/json, text/plain, */*',
                        'authorization': "Bearer " + this.loginToken,
                    }
                });
                return response.data.data.output;
            }
            else throw new Error("No roomId was found.")
        } catch (e) {
            throw new Error("No roomId was found."+e)
        }
    }
}