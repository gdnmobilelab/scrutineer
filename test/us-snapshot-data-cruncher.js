const snapshotDataCruncher = require('./us-snapshot-data-cruncher');
const assert = require('chai').assert;

function generateSnapshot() {
    return {
        "reporting": 76880,
        "total": 170819,
        "results": [
            {
                "id": 1746,
                "votes": 18674391,
                "electWon": 300
            },
            {
                "id": 8639,
                "votes": 18338384,
                "electWon": 0
            },
            {
                "id": 31708,
                "votes": 3273764
            },
            {
                "id": 895,
                "votes": 2326700
            },
            {
                "id": -1,
                "votes": 2086614
            }
        ]
    }
}

var currentSnapshot = snapshotDataCruncher(generateSnapshot());

beforeEach(function() {
    currentSnapshot = snapshotDataCruncher(generateSnapshot());
});


describe('usSnapshotDataCruncher', function() {
    describe('clintonElectoralVotes', function() {
        it('should give clintons total electoral votes', function() {
            assert.equal(currentSnapshot.clintonElectoralVotes(), 300);
        });
    });

    describe('clintonElectoralVotes', function() {
        it('should handle candidate having no electoral votes', function() {
            var snapshot = generateSnapshot();
            delete snapshot['results'][0]['electWon'];
            currentSnapshot = snapshotDataCruncher(snapshot);
            assert.equal(currentSnapshot.clintonElectoralVotes(), 0);
        });
    });

    describe('trumpElectoralVotes', function() {
        it('should give trumps total electoral votes', function() {
            assert.equal(currentSnapshot.trumpElectoralVotes(), 0);
        });
    });

    describe('clintonPopularVotePercentage', function() {
        it('should give clintons popular vote percentage to two decimal places', function() {
            assert.equal(currentSnapshot.clintonPopularVotePercentage(), 41.78);
        });
    });

    describe('clintonElectoralVotes', function() {
        it('should give clintons popular vote percentage to two decimal places if missing votes property', function() {
            var snapshot = generateSnapshot();
            delete snapshot['results'][0]['votes'];
            currentSnapshot = snapshotDataCruncher(snapshot);
            assert.equal(currentSnapshot.clintonPopularVotePercentage(), 0.00);
        });
    });



    describe('trumpPopularVotePercentage', function() {
        it('should give trumps popular vote percentage to two decimal places', function() {
            assert.equal(currentSnapshot.trumpPopularVotePercentage(), 41.03);
        });
    })
});