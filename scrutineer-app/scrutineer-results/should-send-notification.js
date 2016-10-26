
module.exports = function(lastNotificationSentData, currentNotificationData) {
    return true;

    const SEND_WHEN_POPULAR_VOTE_PERCENTAGE_DIFF_IS_GREATER_THAN_FOR_CLINTON = 1,
        SEND_WHEN_POPULAR_VOTE_PERCENTAGE_DIFF_IS_GREATER_THAN_FOR_TRUMP = 1,
        SEND_WHEN_ELECTORAL_VOTE_DIFFERENCE_IS_GREATER_THAN_FOR_CLINTON = 1,
        SEND_WHEN_ELECTORAL_VOTE_DIFFERENCE_IS_GREATER_THAN_FOR_TRUMP = 1,
        SEND_WHEN_PRECINCTS_PERCENTAGE_CALLED_IS_GREATER_THAN = 1,
        SEND_WHEN_CHANGE_IN_STATES_CALLED_IS_GREATER_THAN = 1;

    var currentClinton = currentNotificationData.CLINTON,
        oldClinton = lastNotificationSentData.CLINTON,
        currentTrump = currentNotificationData.TRUMP,
        oldTrump = lastNotificationSentData.TRUMP;


    //Taking the absolute of all these differences to account for shifts in popular percentage
    //(Probably won't need for electoral votes and states called, but can't hurt)
    console.log('Clinton popular vote:', currentClinton.popularVotePercentage, oldClinton.popularVotePercentage, Math.abs(currentClinton.popularVotePercentage - oldClinton.popularVotePercentage));
    if (Math.abs(currentClinton.popularVotePercentage - oldClinton.popularVotePercentage)
        >= SEND_WHEN_POPULAR_VOTE_PERCENTAGE_DIFF_IS_GREATER_THAN_FOR_CLINTON) {
        return true;
    }

    console.log('Trump popular vote:', currentTrump.popularVotePercentage, oldTrump.popularVotePercentage, Math.abs(currentTrump.popularVotePercentage - oldTrump.popularVotePercentage));
    if (Math.abs(currentTrump.popularVotePercentage - oldTrump.popularVotePercentage)
        >= SEND_WHEN_POPULAR_VOTE_PERCENTAGE_DIFF_IS_GREATER_THAN_FOR_TRUMP) {
        return true;
    }

    if (Math.abs(currentClinton.electoralVotes - oldClinton.electoralVotes)
        >= SEND_WHEN_ELECTORAL_VOTE_DIFFERENCE_IS_GREATER_THAN_FOR_CLINTON) {
        return true;
    }

    if (Math.abs(currentTrump.electoralVotes - oldTrump.electoralVotes)
        >= SEND_WHEN_ELECTORAL_VOTE_DIFFERENCE_IS_GREATER_THAN_FOR_TRUMP) {
        return true;
    }

    console.log('Percentage of precincts reporting:', currentNotificationData.percentageOfPrecinctsReporting, lastNotificationSentData.percentageOfPrecinctsReporting, Math.abs(currentNotificationData.percentageOfPrecinctsReporting - lastNotificationSentData.percentageOfPrecinctsReporting))
    if (Math.abs(currentNotificationData.percentageOfPrecinctsReporting - lastNotificationSentData.percentageOfPrecinctsReporting)
        >= SEND_WHEN_PRECINCTS_PERCENTAGE_CALLED_IS_GREATER_THAN) {
        return true;
    }

    if (Math.abs(currentNotificationData.statesCalled - lastNotificationSentData.statesCalled) >= SEND_WHEN_CHANGE_IN_STATES_CALLED_IS_GREATER_THAN) {
        return true;
    }

    return false;
}