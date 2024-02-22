const http = require('node:https');

async function sendRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => resolve(JSON.parse(Buffer.concat(chunks).toString())));
            res.on('error', (err) => reject(err));
        });
        if (data) req.write(data);
        req.end();
    });
}

async function submit(expression, subject, options = {}) {
    return new Promise(async (resolve, reject) => {
        const body = {
            metadata: { route: options?.language },
            asciiMath: expression,
            subject
        }

        const response = await sendRequest({
            method: "POST",
            hostname: "www.mathway.com",
            path: "/chat/editor",
            headers: { "Content-Type": "application/json" }
        }, JSON.stringify(body));

        const result = { type: response.type }

        if (response.messages) {
            result.messages = response.messages.map(msg => {
                return {
                    content: msg.content,
                    genre: msg.genre,
                    timestamp: msg.timestamp
                }
            });
        }

        if (response.topics) {
            result.topics = response.topics.map(topic => {
                return {
                    id: topic.Id,
                    score: topic.Score,
                    text: topic.Text,
                    customData: { variable: topic.CustomData.VAR },
                    getResult: () => getTopicResult(expression, subject, topic.Id, { customData: { variable: topic.CustomData.VAR } }, options?.language),
                }
            });
        }

        resolve(result);
    });
}

async function getTopicResult(expression, subject, topicId, options = {}) {
    return new Promise(async (resolve, reject) => {
        const body = {
            metadata: { route: options?.language },
            asciiMath: expression,
            subject,
            topicId: Number(topicId),
            CustomData: { VAR: options?.customData?.variable },
        }

        const response = await sendRequest({
            method: "POST",
            hostname: "www.mathway.com",
            path: "/chat/topics",
            headers: { "Content-Type": "application/json" },
        }, JSON.stringify(body));

        const result = { type: response.type }

        result.messages = response.messages.map(msg => {
            return {
                content: msg.content,
                genre: msg.genre,
                timestamp: msg.timestamp,
                callout: msg.callout,
            }
        });

        resolve(result);
    });
}

async function greet(subject, options = {}) {
    return new Promise(async (resolve, reject) => {
        const body = {
            metadata: { route: options?.language },
            subject,
        }

        const response = await sendRequest({
            method: "POST",
            hostname: "www.mathway.com",
            path: "/chat/greeting",
            headers: { "Content-Type": "application/json" },
        }, JSON.stringify(body));

        const result = { type: response.type }

        result.messages = response.messages.map(msg => {
            return {
                content: msg.content,
                genre: msg.genre,
                timestamp: msg.timestamp,
            }
        });

        resolve(result);
    });
}

async function getGlossaryTerm(termId) {
    return new Promise(async (resolve, reject) => {
        const response = await sendRequest({
            method: "GET",
            hostname: "www.mathway.com",
            path: "/localsolver/rest/getGlossaryDefinition/" + termId,
            headers: { "Referer": "https://www.mathway.com/" }
        });

        if (response.status === 1)
            resolve(response.definition);
        else reject(response.message);
    });
}

module.exports.submit = submit;
module.exports.getTopicResult = getTopicResult;
module.exports.greet = greet;
module.exports.getGlossaryTerm = getGlossaryTerm;
