const http = require('node:https');

/** @typedef {"BasicMath"|"prealgebra"|"algebra"|"trigonometry"|"precalculus"|"calculus"|"statistics"|"finitemath"|"linearalgebra"|"chemistry"|"physics"} Subject */

/**
 * @typedef {object} Topic
 * @property {number} id - Unique ID of the topic
 * @property {number} score - Number from 0 to 1. Probability that this topic was meant
 * @property {string} text - Topic text
 */

/**
 * @typedef {object} Message
 * @property {string} content - Content of the message (with HTML tags)
 * @property {"mathway"|"message"|"autoresolve"|"greeting"} genre - Genre/Type of the message
 * @property {number} timestamp - Timestamp of the message
 */

/** 
 * @typedef {object} TopicsResponse
 * @property {"topicsResponse"} type - Response type
 * @property {Topic[]} topics - Array of suggested topics
 * 
*/

/**
 * @typedef {object} MessagesResponse
 * @property {"messagesResponse"} type - Response type
 * @property {Message[]} messages - Messages related to the provided request
 */

/** @typedef {TopicsResponse|MessagesResponse} MathwayResponse */

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
 * @param {string} [language] - 2-letter code of answers language
 * @returns {Promise<MathwayResponse>}
*/
async function submit(expression, subject, language) {
    return new Promise(async (resolve, reject) => {
        const body = {
            metadata: {
                route: language
            },
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
                    text: topic.Text
                }
            });
        }

        resolve(result);
    });
}

module.exports.submit = submit;
