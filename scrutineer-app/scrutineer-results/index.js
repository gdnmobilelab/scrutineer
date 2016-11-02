const CONFIG = require('./../config');
const mostRecentTimestamp = require('./most-recent-update-timestamp');
const ingestSnapshotData = require('./us-snapshot-data-cruncher');
const fetchResults = require('./fetch-results');
const createNotification = require('../shared-utils/create-notification');
const sendNotification = require('../services/send-notification');
const shouldWeSendANotification = require('./should-send-notification');
const getCalledStates = require('./get-called-states');
const getCalledSwingStates = require('./get-called-swing-states');
const db = require('../services/db');
const uuid = require('node-uuid');
const log = require('../services/logger');

const FETCH_RESULTS_INTERVAL = 7 * 1000;

function pollResults() {
    return Promise.all([db.getActiveDateLastSentAndModifications(), mostRecentTimestamp()])
        .then(([dateLastSentAndModifications, theirTimestamp]) => {
            var ourTimestamp = dateLastSentAndModifications.date,
                lastNotificationSentData = dateLastSentAndModifications.lastSent,
                notificationModifications = dateLastSentAndModifications.modifications || {};

            log(`ourTimestamp: ${ourTimestamp}, theirTimestamp: ${theirTimestamp}`);

            //If we don't have a timestamp, don't do anything
            if (ourTimestamp === theirTimestamp) {
                return Promise.resolve({
                    success: true,
                    notificationSent: false,
                    reason: 'Timestamps are identical'
                });
            } else if (!theirTimestamp) {
                return Promise.error(new Error('Could not fetch timestamp from last-updated.json'));
            } else {
                //Our timestamps differ, mark this timestamp as the last timestamp
                return db.saveDate(theirTimestamp)
                    .then(() => {
                        //Fetch our US election results
                        return fetchResults.snapshotResultsFromDateString(theirTimestamp)
                    })
                    .then((overallSnapshot) => {
                        let presidentialResults = overallSnapshot['p'],
                            usSnapshot = presidentialResults['US'],
                            statesCalled = getCalledStates(presidentialResults),
                            swingStatesCalled = getCalledSwingStates(statesCalled, CONFIG.SWING_STATES);

                        log(`Number of states called: ${statesCalled.length}`);
                        //Format our US election results
                        let snapshot = ingestSnapshotData(usSnapshot);
                        return Object.assign({
                            percentageOfPrecinctsReporting: snapshot.percentageOfPrecinctsReporting(),
                            forDate: theirTimestamp,
                            statesCalled: statesCalled,
                            swingStatesCalled: swingStatesCalled
                        }, snapshot.candidates());
                    })
                    .then((currentNotificationData) => {
                        //Should we send a notification at all?
                        if (lastNotificationSentData && !shouldWeSendANotification(lastNotificationSentData, currentNotificationData)) {
                            return Promise.resolve({
                                success: true,
                                notificationSent: false,
                                reason: 'Recent updates did not pass thresholds for sending'
                            });
                        } else {
                            //Hey! We should send a notification now
                            let id = uuid.v4();

                            var notification = createNotification(id,
                                                currentNotificationData,
                                                notificationModifications);

                            return db.saveSentNotification(id, currentNotificationData, notification, notificationModifications.id).then((buzzOnce) => {
                                //Buzz the first time we send and buzz for all future notifications
                                if (!ourTimestamp || buzzOnce) {
                                    notification.importance = 'Major'
                                }

                                log(JSON.stringify(notification));

                                var sent = CONFIG.SEND_NOTIFICATIONS ? sendNotification(notification) : Promise.resolve({message: 'Configuration set to not send notifications'});
                                return sent
                                    .then((result) => {
                                        return {
                                            success: true,
                                            notificationSent: true,
                                            reason: JSON.stringify(result)
                                        }
                                    })
                            });
                        }
                    })
            }
        });
}

function pollPollResults() {
    pollResults().then((msg) => {
        console.log(msg);
        setTimeout(pollPollResults, FETCH_RESULTS_INTERVAL)
    }).catch((err) => {
        setTimeout(pollPollResults, FETCH_RESULTS_INTERVAL);
        console.log(`Error`);
        console.log(err);

        //The `code` property is from node-mysql
        return db.saveNotificationError(err.code ? err.code : err.message, err.stack)
            .catch((err) => {
                console.log(`Error saving error... ${err}`);
            });
    });
}

pollPollResults();