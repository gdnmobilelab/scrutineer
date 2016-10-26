const getMostRecentUpdate = require('./most-recent-update-timestamp');
const assert = require('assert');

describe('mostRecentUpdateTimestamp', function() {
    describe('getMostRecentUpdate', function() {
        it('should return a date object that is equal to the newest timestamp', function() {
            return getMostRecentUpdate().then((date) => {
                assert.equal(date, '2016-10-12T18:39:23.338Z');
            });
        });
    });
});