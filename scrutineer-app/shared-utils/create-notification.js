const numeral = require('numeral');
const PERCENTAGE_FORMAT = '00.00';

module.exports = function(id, notificationData, modifications) {
        let percentageOfPrecinctsReporting = notificationData.percentageOfPrecinctsReporting,
            clinton = notificationData.CLINTON,
            trump = notificationData.TRUMP,
            title = modifications.title || `Clinton: ${clinton.electoralVotes}, Trump ${trump.electoralVotes}`,
            swingStatesText = notificationData.swingStatesCalled.length > 0 ? ` (${notificationData.swingStatesCalled.join(', ').trim()})` : '',
            statesPlural = notificationData.statesCalled.length === 1 ? 'state' : 'states',
            swingStatesPlural = notificationData.swingStatesCalled.length === 1 ? 'state' : 'states',
            notificationMessage = [
                modifications.line2 ? `• ${modifications.line2}` : `• ${notificationData.statesCalled.length} ${statesPlural} called`,
                modifications.line3 ? `• ${modifications.line3}` : `• ${notificationData.swingStatesCalled.length} swing ${swingStatesPlural} called${swingStatesText}`,
                modifications.line4 ? `• ${modifications.line4}` : `• Popular vote: Clinton ${numeral(clinton.popularVotePercentage).format(PERCENTAGE_FORMAT)}%, Trump ${numeral(trump.popularVotePercentage).format(PERCENTAGE_FORMAT)}%`,
                modifications.line5 ? `• ${modifications.line5}` : `• ${percentageOfPrecinctsReporting}% precincts reporting`
            ].join("\n");

    return {
        "id": id,
        "type": "election",
        "sender": "us-elections-service",
        "title": title,
        "message": notificationMessage,
        "importance": "Minor",
        "link": {
            "contentApiId": "live-blog/content-api/id",
            "shortUrl": "http://gu.com/p/4p7xt",
            "git": {"mobileAggregatorPrefix": "item-trimmed"}
        },
        "resultsLink": {
            "contentApiId": "live-blog/content-api/id",
            "shortUrl": "http://gu.com/p/586tz",
            "git": {"mobileAggregatorPrefix": "item-trimmed"}
        },
        "results": {
            "candidates": [
                {
                    "name": "Clinton",
                    "states": [],
                    "electoralVotes": clinton.electoralVotes,
                    "popularVotes": clinton.popularVotes,
                    "avatar": "http://avatar-url",
                    "color": "#005689"
                },
                {
                    "name": "Trump",
                    "states": [],
                    "electoralVotes": trump.electoralVotes,
                    "popularVotes": trump.popularVotes,
                    "avatar": "http://avatar-url",
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