const http = require('node:https');

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

        resolve(response);
    });
}

module.exports.submit = submit;
