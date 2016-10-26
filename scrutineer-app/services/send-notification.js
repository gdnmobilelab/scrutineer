const CONFIG = require('../config');

const fetch = require('node-fetch');

module.exports = function(notification) {
    return fetch(CONFIG.PUSH_API, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(notification)
    }).then((res) => {
        return res.json();
    })
};