const numeral = require('numeral');
const PERCENTAGE_FORMAT = '00';

module.exports = function(id, notificationData, modifications) {
        let percentageOfPrecinctsReporting = notificationData.percentageOfPrecinctsReporting,
            clinton = notificationData.CLINTON,
            trump = notificationData.TRUMP,
            title = modifications.title || 'Live presidential election results',
            statesWithoutDC = notificationData.statesCalled.filter((code) => code !== '11'),
            isDCCalled = notificationData.statesCalled.find((code) => code === '11') ? true : false,
            importantSwingStates = notificationData.swingStatesCalled.filter((swingState) => !!swingState.important),
            importantSwingStatesCodes = importantSwingStates.map((important) => important.alpha),
            importantSwingStatesText =  notificationData.swingStatesCalled.length - importantSwingStatesCodes.length > 3 ? ` (incl. ${importantSwingStatesCodes.join(', ').trim()})` : '',
            swingStatesPlural = notificationData.swingStatesCalled.length === 1 ? `${notificationData.swingStatesCalled.length} is a swing state` : `${notificationData.swingStatesCalled.length} are swing states${importantSwingStatesText}`,
            statesPlural = statesWithoutDC.length === 1 ? 'state' : 'states',
            calledText = isDCCalled ? `${statesWithoutDC.length} ${statesPlural} called + DC` : `${statesWithoutDC.length} ${statesPlural} called`,
            notificationMessage = [
                modifications.line1 ? `• ${modifications.line1}` : `• ${calledText}`,
                modifications.line2 ? `• ${modifications.line2}` : `• ${swingStatesPlural}`,
                modifications.line3 ? `• ${modifications.line3}` : `• ${percentageOfPrecinctsReporting}% precincts reporting`,
                modifications.line4 ? `• ${modifications.line4}` : `• Popular vote: Clinton ${numeral(clinton.popularVotePercentage).format(PERCENTAGE_FORMAT)}%, Trump ${numeral(trump.popularVotePercentage).format(PERCENTAGE_FORMAT)}%`,
            ],
            iosCollapsedMessage = [
                modifications.iOSCollapsed1 ? `• ${modifications.iOSCollapsed1}` : `• Electoral votes: Clinton ${clinton.electoralVotes}, Trump ${trump.electoralVotes}`,
                modifications.iOSCollapsed2 ? `• ${modifications.iOSCollapsed2}` : `• 270 electoral votes to win`
            ].concat(notificationData.statesCalled.length === 0 ? notificationMessage.slice(2) : notificationMessage.slice(0, 1)), //Switch lines depending on if states reporting
            androidCollapsedMessage = modifications.androidCollapsed1 ? `${modifications.androidCollapsed1}` : `Electoral votes: Clinton ${clinton.electoralVotes}, Trump ${trump.electoralVotes}`,
            trumpAvatar = modifications.trumpAvatar ? modifications.trumpAvatar : 'https://www.gdnmobilelab.com/candidates/trump-normal-resized.png',
            clintonAvatar = modifications.clintonAvatar ? modifications.clintonAvatar : 'https://www.gdnmobilelab.com/candidates/clinton-normal-resized.png';

    return {
        "id": id,
        "type": "election",
        "sender": "us-elections-service",
        "title": title,
        "expandedMessage": notificationMessage.join('\n'), //for both Android and iOS, shown along with graph
        "message": iosCollapsedMessage.join('\n'), //shown on iOS when collapsed
        "shortMessage": androidCollapsedMessage, //shown on Android when collapsed
        "importance": "Minor",
        "link": {
            "contentApiId": "us-news/live/2016/nov/01/donald-trump-russia-hillary-clinton-emails-campaign-live",
            "shortUrl": "https://www.theguardian.com/us-news/live/2016/nov/01/donald-trump-russia-hillary-clinton-emails-campaign-live",
            "git": {"mobileAggregatorPrefix": "item-trimmed"}
        },
        "resultsLink": {
            "contentApiId": "us-news/live/2016/nov/01/donald-trump-russia-hillary-clinton-emails-campaign-live",
            "shortUrl": "https://www.theguardian.com/us-news/live/2016/nov/01/donald-trump-russia-hillary-clinton-emails-campaign-live",
            "git": {"mobileAggregatorPrefix": "item-trimmed"}
        },
        "results": {
            "candidates": [
                {
                    "name": "Clinton",
                    "states": [],
                    "electoralVotes": clinton.electoralVotes,
                    "popularVotes": clinton.popularVotes,
                    "avatar": clintonAvatar,
                    "color": "#005689"
                },
                {
                    "name": "Trump",
                    "states": [],
                    "electoralVotes": trump.electoralVotes,
                    "popularVotes": trump.popularVotes,
                    "avatar": trumpAvatar,
                    "color": "#d61d00"
                }
            ]
        },
        "topic": [ {
            "type": "election-results",
            "name": "us-presidential-2016"
        }]
    };
};