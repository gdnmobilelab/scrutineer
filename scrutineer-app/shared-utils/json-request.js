const fetch = require('node-fetch');

function checkStatus(response) {
    if (response.status >= 200 && response.status < 300) {
        return response
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error
    }
}

module.exports = function(url, opts) {
    if (opts === null) {
        opts = { method: 'GET' }
    }

    return fetch(url, opts)
        .then(checkStatus)
        .then(function(res) {
            return res.json();
        });
};