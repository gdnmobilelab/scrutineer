const jsonRequest = require('../shared-utils/json-request');
const CONFIG = require('./../config');
const log = require('../services/logger');

module.exports = {
    __createSnapshotURLFromDateString: function(dateString) {
        return `${CONFIG.SNAPSHOT_API}/${dateString}.json`;
    },

    snapshotResultsFromDateString: function(dateString) {
        let URL = this.__createSnapshotURLFromDateString(dateString);
        log(URL);
        return jsonRequest(URL).then((json) => {
            return json;
        })
    },

    usSnapshotResultsFromDateString: function(dateString) {
        return this.snapshotResultsFromDateString(dateString).then((json) => {
            return json['p']['US'];
        });
    }
};