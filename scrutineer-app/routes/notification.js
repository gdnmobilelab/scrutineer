var express = require('express');
var router = express.Router();
const DB = require('../services/db');
const createNotification = require('../shared-utils/create-notification');
const CONFIG = require('../config');
const uuid = require('node-uuid');
const sendNotification = require('../services/send-notification');
const log = require('../services/logger');

/* GET home page. */
router.get('/', function(req, res, next) {
    return DB.getNotificationModificationAndLastSent().then(({modifications, notification}) => {
        return res.send({
            modifications: modifications,
            notification: notification
        });
    }).catch((err) => {
        console.log(err);
        res.status(500);
        res.send(err);
    })
});

router.post('/modifications', function(req, res, next) {
    var modification = req.body;
    modification.id = uuid.v4();

    var invalidProperty = null;
    let isValidModification = Object.keys(modification).reduce((coll, attr) => {
        if (typeof modification[attr] === 'string' && modification[attr].length < 1) {
            invalidProperty = attr;
            return coll && false;
        } else {
            return coll;
        }
    }, true);

    if (!isValidModification) {
        res.status(400);
        return res.send({
            success: false,
            msg: `The property "${invalidProperty}" is an empty string. Empty strings are not allowed`
        })
    }

    //Hm, would be nice to crunch these DB calls into one
    DB.saveNotificationModification(modification).then(() => {
        //Todo: does express convert "true" to true?
        if (req.query.send === true || req.query.send === "true") {
            return DB.getLastSentNotification().then((notification) => {
                var notificationData = JSON.parse(notification.notificationDataJson),
                    toSendId = uuid.v4(),
                    toSend = createNotification(toSendId, notificationData, modification);

                return DB.saveSentNotification(toSendId, notificationData, toSend, modification.id).then((buzzOnce) => {
                    if (buzzOnce) {
                        notification.importance = 'Major'
                    }

                    log(`Sending notification manually: ${JSON.stringify(notification)}`);

                    var sent = CONFIG.SEND_NOTIFICATIONS ? sendNotification(notification) : Promise.resolve({
                        success: true,
                        notificationSent: false,
                        reason: 'Modification saved and configuration set to not send notifications'
                    });
                    return sent
                        .then((result) => {
                            return {
                                success: true,
                                notificationSent: true,
                                reason: 'Modification saved and notification sent'
                            }
                        })
                });
            })
        } else {
            return {
                success: true,
                notificationSent: false,
                reason: 'Modification saved'
            }
        }
    }).then((result) => {
        res.status(200);
        res.send({
            success: result.success,
            msg: result.reason
        })
    }).catch((err) => {
        res.status(500);
        res.send({
            success: false,
            msg: err.code ? err.code : err.message
        })
    })
});

module.exports = router;
