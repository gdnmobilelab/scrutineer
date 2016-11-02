var mysql = require('promise-mysql');
var Promise = require("bluebird");
const CONFIG = require('../config');
const log = require('../services/logger');

pool = mysql.createPool({
    host: CONFIG.DB_HOST,
    user: CONFIG.DB_USER,
    password: CONFIG.DB_PASSWORD,
    database: CONFIG.DB_DATABASE,
    connectionLimit: 10
});

function getSqlConnection() {
    return pool.getConnection().disposer(function(connection) {
        pool.releaseConnection(connection);
    });
}

function query(sql, args) {
    return Promise.using(getSqlConnection(), function(connection) {
        return connection.query({
                sql: sql,
                timeout: 30000
            },
            args).then(function(rows) {
            return rows
        });
    })
}

function dbRowToNotificationData(dbRow) {
    return {
        id: dbRow.id,
        sentAt: dbRow.created_on,
        CLINTON: {
            'electoralVotes': dbRow.clinton_electoral_vote,
            'popularVotePercentage': dbRow.clinton_popular_vote_percentage,
        },
        TRUMP: {
            'electoralVotes': dbRow.trump_electoral_vote,
            'popularVotePercentage': dbRow.trump_popular_vote_percentage,
        },
        percentageOfPrecinctsReporting: dbRow.percent_precincts_reporting_percentage,
        statesCalled: dbRow.num_states_called,
        sentNotificationJson: dbRow.sent_notification_json,
        notificationDataJson: dbRow.notification_data_json
    }
}

function dbRowToModifications(dbRow) {
    return {
        id: dbRow.id,
        title: dbRow.title,
        line1: dbRow.line1,
        line2: dbRow.line2,
        line3: dbRow.line3,
        line4: dbRow.line4,
        iOSCollapsed1: dbRow.iOSCollapsed1,
        iOSCollapsed2: dbRow.iOSCollapsed2,
        androidCollapsed1: dbRow.androidCollapsed1,
        clintonAvatar: dbRow.clinton_avatar,
        trumpAvatar: dbRow.trump_avatar,
        buzzOnce: dbRow.buzz_once,
        createdOn: dbRow.created_on
    }
}

module.exports = {
    getActiveDateLastSentAndModifications: function() {
        return query('call p_GetActiveDateLastSentAndModifications()', []).then((rowResult) => {
            var toReturn = {
                date: null,
                lastSent: null,
                modifications: null
            };

            let dateRow = rowResult[0][0];
            if (dateRow) {
                toReturn.date = dateRow.date;
            }

            let lastSent = rowResult[1][0];
            if (lastSent) {
                toReturn.lastSent = dbRowToNotificationData(lastSent);
            }

            let modifications = rowResult[2][0];
            if (modifications) {
                toReturn.modifications = dbRowToModifications(modifications);
            }

            return toReturn;
        });
    },
    getActiveDate: function() {
        return query('call p_GetActiveDate()', []).then((rowResult) => {
            if (rowResult[0].length < 1) {
                return null;
            } else {
                return rowResult[0][0].date;
            }
        })
    },
    saveDate: function(date) {
        return query('call p_CreateDate(?)', [date]);
    },
    getSentNotifications: function() {
        return query('call p_GetSentNotifications()', []).then((rowResult) => {
            return rowResult[0].map(dbRowToNotificationData)
        })
    },
    getLastSentNotification: function() {
        return query('call p_GetLastSentNotification()', []).then((rowResult) => {
            if (rowResult[0].length < 1) {
                return null;
            } else {
                var dbRow = rowResult[0][0];
                return dbRowToNotificationData(dbRow);
            }
        })
    },
    //Returns: whether or not notification should buzz
    saveSentNotification(id, notificationData, notification, notificationModificationId) {
        return query('call p_CreateSentNotification(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
                id,
                notificationData.CLINTON.electoralVotes,
                notificationData.TRUMP.electoralVotes,
                notificationData.CLINTON.popularVotePercentage,
                notificationData.TRUMP.popularVotePercentage,
                notificationData.percentageOfPrecinctsReporting,
                notificationData.statesCalled.length,
                JSON.stringify(notificationData),
                JSON.stringify(notification),
                notificationModificationId
            ]).then((rowResult) => {
            if (rowResult[0].length < 1) {
                return false;
            } else {
                return rowResult[0][0].should_buzz;
            }
        })
    },
    getNotificationModification: function() {
        return query('call p_GetNotificationModification()', []).then((rowResult) => {
            if (rowResult[0].length < 1) {
                return null;
            } else {
                var dbRow = rowResult[0][0];
                return dbRowToModifications(dbRow);
            }
        })
    },
    saveNotificationModification: function(notificationModificationData) {
        return query('call p_CreateNotificationModification(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            notificationModificationData.id,
            notificationModificationData.title,
            notificationModificationData.line1,
            notificationModificationData.line2,
            notificationModificationData.line3,
            notificationModificationData.line4,
            notificationModificationData.iOSCollapsed1,
            notificationModificationData.iOSCollapsed2,
            notificationModificationData.androidCollapsed1,
            notificationModificationData.clintonAvatar,
            notificationModificationData.trumpAvatar,
            notificationModificationData.buzzOnce
        ]);
    },
    getNotificationModificationAndLastSent: function() {
        return query('call p_GetNotificationModificationAndLastSent()', []).then((rowResult) => {
            return {
                modifications: rowResult[0][0] ? dbRowToModifications(rowResult[0][0]) : null,
                notification: rowResult[1][0] ? dbRowToNotificationData(rowResult[1][0]) : null
            }
        })
    },
    saveNotificationError: function(message, stack) {
        return query('call p_CreateNotificationError(?, ?)', [message, stack]);
    },
    getNotificationsAndErrorsSince: function(date) {
        console.log(date);
        return query('call p_GetNotificationsSentAndErrors(?)', [date]).then((rowResult) => {
            return {
                notifications: rowResult[0].map(dbRowToNotificationData),
                errors: rowResult[1].map((error) => {
                    return {
                        id: error.id,
                        createdOn: error.created_on,
                        message: error.message,
                        stack: error.stack
                    }
                })
            }
        })
    }
};