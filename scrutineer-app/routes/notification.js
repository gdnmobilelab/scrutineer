var express = require('express');
var router = express.Router();
const DB = require('../services/db');
const createNotification = require('../shared-utils/create-notification');
const CONFIG = require('../config');
const uuid = require('node-uuid');

/* GET home page. */
router.get('/', function(req, res, next) {
    return DB.getSentNotificationsAndNotificationModification().then((sentNotificationsData) => {
        return res.send({
            notifications: sentNotificationsData.notifications.map((sent) => {
                // return createNotification(sent.id, sent, CONFIG.SWING_STATES, {});
                return Object.assign({}, JSON.parse(sent.sentNotificationJson), { sentAt: sent.sentAt });
            }),
            modifications: sentNotificationsData.modifications
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

    DB.saveNotificationModification(modification).then(() => {
        res.status(200);
        res.send({
            success: true,
            msg: 'Modification submitted successfully'
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
