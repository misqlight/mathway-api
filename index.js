const http = require('node:https');

/** @typedef {"BasicMath"|"prealgebra"|"algebra"|"trigonometry"|"precalculus"|"calculus"|"statistics"|"finitemath"|"linearalgebra"|"chemistry"|"physics"} Subject */

/**
 * @callback getResultByTopicFunction
 * @returns {Promise<MessagesResponse>}
 */

/**
 * @typedef {object} Topic
 * @property {number} id - Unique ID of the topic
 * @property {number} score - Number between 0 and 1. Probability that this topic was meant
 * @property {string} text - Topic text
 * @property {object} customData - Custom topic data
 * @property {string} [customData.variable] - Name of the variable to act with
 * @property {getResultByTopicFunction} getResult - Function to get result by this topic
 */

/**
 * @typedef {object} Message
 * @property {string} content - Content of the message (with HTML tags)
 * @property {"mathway"|"message"|"autoresolve"|"greeting"|"rating"} genre - Genre/Type of the message
 * @property {number} timestamp - Timestamp of the message
 */

/** 
 * @typedef {object} TopicsResponse
 * @property {"topicsResponse"} type - Response type
 * @property {Topic[]} topics - Array of suggested topics
*/

/**
 * @typedef {object} MessagesResponse
 * @property {"messagesResponse"} type - Response type
 * @property {Message[]} messages - Messages related to the provided request
 */

/** @typedef {TopicsResponse|MessagesResponse} MathwayResponse */

/**
 * @typedef {object} CustomData
 * @property {string} [variable] - Name of the variable to act with
 */

/** @param {http.RequestOptions} options */
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

/**
 * Submit an expression to MathWay
 * 
 * @public
 * @param {string} expression - Expression to submit (in LaTeX)
 * @param {Subject} subject - Answers subject
 * @param {object} [options] - Options
 * @param {string} [options.language] - 2-letter code of answers language
 * @returns {Promise<MathwayResponse>}
*/
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
                    getResult: () => getTopicResult(expression, subject, topic.Id, { customData: { variable: topic.CustomData.VAR }, language }),
                }
            });
        }

        resolve(result);
    });
}

/**
 * Return an result for the expression related to the topic
 * 
 * @public
 * @param {string} expression - Expression to submit (in LaTeX)
 * @param {Subject} subject - Answers subject
 * @param {string|number} topicId - ID of the topic
 * @param {object} [options] - Options
 * @param {CustomData} [options.customData] - Custom topic data
 * @param {string} [options.language] - 2-letter code of answers language
 * @returns {Promise<MessagesResponse>}
*/
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
            }
        });

        resolve(result);
    });
}

/**
 * Sends greeting request to MathWay
 * 
 * @public
 * @param {Subject} subject - Answers subject
 * @param {string} [language] - 2-letter code of answers language
 * @param {object} [options] - Options
 * @param {string} [options.language] - 2-letter code of answers language
 * @returns {Promise<MessagesResponse>}
 */
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

/**
 * Get glossary term definition
 * 
 * @public
 * @param {string|number} termId - Term ID
 * @returns {Promise<string>}
 */
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
