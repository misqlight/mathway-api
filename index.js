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
