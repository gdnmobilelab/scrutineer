const log = require('../services/logger');

module.exports = function(lastNotificationSentData, currentNotificationData) {
    const SEND_WHEN_POPULAR_VOTE_PERCENTAGE_DIFF_IS_GREATER_THAN_FOR_CLINTON = 2,
        SEND_WHEN_POPULAR_VOTE_PERCENTAGE_DIFF_IS_GREATER_THAN_FOR_TRUMP = 2,
        SEND_WHEN_ELECTORAL_VOTE_DIFFERENCE_IS_GREATER_THAN_FOR_CLINTON = 1,
        SEND_WHEN_ELECTORAL_VOTE_DIFFERENCE_IS_GREATER_THAN_FOR_TRUMP = 1,
        SEND_WHEN_PRECINCTS_PERCENTAGE_CALLED_IS_GREATER_THAN = 1,
        SEND_WHEN_CHANGE_IN_STATES_CALLED_IS_GREATER_THAN = 1;

    var currentClinton = currentNotificationData.CLINTON,
        oldClinton = lastNotificationSentData.CLINTON,
        currentTrump = currentNotificationData.TRUMP,
        oldTrump = lastNotificationSentData.TRUMP;

    log(`current precincts reporting: ${currentNotificationData.percentageOfPrecinctsReporting}, last precincts reporting: ${lastNotificationSentData.percentageOfPrecinctsReporting}`);
    return [
        Math.abs(Math.floor(currentClinton.popularVotePercentage - oldClinton.popularVotePercentage)) >= SEND_WHEN_POPULAR_VOTE_PERCENTAGE_DIFF_IS_GREATER_THAN_FOR_CLINTON,
        Math.abs(Math.floor(currentTrump.popularVotePercentage - oldTrump.popularVotePercentage)) >= SEND_WHEN_POPULAR_VOTE_PERCENTAGE_DIFF_IS_GREATER_THAN_FOR_TRUMP,
        Math.abs(Math.floor(currentClinton.electoralVotes - oldClinton.electoralVotes)) >= SEND_WHEN_ELECTORAL_VOTE_DIFFERENCE_IS_GREATER_THAN_FOR_CLINTON,
        Math.abs(Math.floor(currentTrump.electoralVotes - oldTrump.electoralVotes)) >= SEND_WHEN_ELECTORAL_VOTE_DIFFERENCE_IS_GREATER_THAN_FOR_TRUMP,
        Math.abs(Math.floor(currentNotificationData.percentageOfPrecinctsReporting - lastNotificationSentData.percentageOfPrecinctsReporting)) >= SEND_WHEN_PRECINCTS_PERCENTAGE_CALLED_IS_GREATER_THAN,
        Math.abs(Math.floor(currentNotificationData.statesCalled - lastNotificationSentData.statesCalled)) >= SEND_WHEN_CHANGE_IN_STATES_CALLED_IS_GREATER_THAN
    ].reduce((coll, cur) => {
        return coll || cur;
    }, false);
};