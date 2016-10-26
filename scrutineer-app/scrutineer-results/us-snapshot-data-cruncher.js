const CONFIG = require('./../config');


var electoralVotesForCandidate = function(candidateId, usSnapshot) {
    var candidate = usSnapshot.results.find(candidate => candidate.id == candidateId);

    if (candidate && candidate.electWon) {
        return candidate.electWon;
    } else {
        return 0;
    }
};

var popularVotePercentageForCandidate = function(candidateId, usSnapshot) {
    var candidate = usSnapshot.results.find(candidate => candidate.id == candidateId);

    if (!candidate || !candidate.votes) {
        return 0;
    }

    var total = usSnapshot.results.reduce( ( total, candidate ) => total + candidate.votes, 0 );

    return 100 * candidate.votes / total;
};

var candidatePopularVoteTotal = function(candidateId, usSnapshot) {
    var candidate = usSnapshot.results.find(candidate => candidate.id == candidateId);

    if (!candidate || !candidate.votes) {
        return 0;
    }

    return candidate.votes;
};

function USSnapshotData(usSnapshot) {
    return {
        clintonElectoralVotes: function() {
            return electoralVotesForCandidate(CONFIG.CLINTON_ID, usSnapshot);
        },

        trumpElectoralVotes: function() {
            return electoralVotesForCandidate(CONFIG.TRUMP_ID, usSnapshot);
        },

        clintonPopularVoteTotal: function() {
            return candidatePopularVoteTotal(CONFIG.CLINTON_ID, usSnapshot)
        },

        trumpPopularVoteTotal: function() {
            return candidatePopularVoteTotal(CONFIG.TRUMP_ID, usSnapshot)
        },

        clintonPopularVotePercentage: function() {
            return popularVotePercentageForCandidate(CONFIG.CLINTON_ID, usSnapshot);
        },

        trumpPopularVotePercentage: function() {
            return popularVotePercentageForCandidate(CONFIG.TRUMP_ID, usSnapshot);
        },

        percentageOfPrecinctsReporting: function() {
            return Math.floor((usSnapshot.reporting / usSnapshot.total) * 100);
        },

        candidates: function() {
            return {
                CLINTON: {
                    'electoralVotes': this.clintonElectoralVotes(),
                    'popularVotes': this.clintonPopularVoteTotal(),
                    'popularVotePercentage': this.clintonPopularVotePercentage(),
                },
                TRUMP: {
                    'electoralVotes': this.trumpElectoralVotes(),
                    'popularVotes': this.trumpPopularVoteTotal(),
                    'popularVotePercentage': this.trumpPopularVotePercentage(),
                }
            }
        }
    }
}

module.exports = function(usSnapshot) {
    return new USSnapshotData(usSnapshot);
};