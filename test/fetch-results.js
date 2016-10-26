const fetchResults = require('./fetch-results');
const assert = require('chai').assert;

var snapshotDate = '2016-10-10T17:48:29.841Z';

describe('fetchResults', function() {
    describe('__createSnapshotURLFromDateString', function() {
        it('given a date string, return a snapshot URL with the date string appended', function() {
            assert.equal(latestResults.__createSnapshotURLFromDateString(snapshotDate), 'https://interactive.guim.co.uk/2016/general-election/results/data/v1/2016-11-08/test/snapshot/2016-10-10T17:48:29.841Z.json');
        });
    });

    describe('snapshotResultsFromDateString', function() {
        it('should fetch the latest snapshot results', function() {
            return latestResults.snapshotResultsFromDateString(snapshotDate).then((snapshot) => {
                assert.property(snapshot, 'p');
                assert.property(snapshot, 's');
                assert.property(snapshot, 'h');
            });
        });
    });

    describe('usSnapshotResultsFromDateString', function() {
        it('should fetch the latest snapshot results', function() {
            return latestResults.usSnapshotResultsFromDateString(snapshotDate).then((us) => {
                assert.equal(us.reporting, 76880);
                assert.equal(us.total, 170819);
            });
        });
    })
});