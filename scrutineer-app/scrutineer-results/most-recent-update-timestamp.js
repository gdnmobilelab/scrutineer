var jsonRequest = require('../shared-utils/json-request');
var CONFIG = require('./../config');

module.exports = function() {
    return jsonRequest(CONFIG.LAST_UPDATED_AT_API)
        .then(function (json) {
            return json.lastUpdated
        })
};
