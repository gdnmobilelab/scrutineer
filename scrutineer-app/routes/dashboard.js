var express = require('express');
var router = express.Router();
const CONFIG = require('../config');
const DB = require('../services/db');
const moment = require('moment');

router.get('/', function(req, res, next) {
    var convertedTime = moment(req.query.since).utc().toDate();
    DB.getNotificationsAndErrorsSince(convertedTime).then((resp) => {
        res.status(200);
        res.send(resp);
    }).catch((err) => {
        console.log(err);
        res.status(500);
        res.send(err);
    })
});

module.exports = router;
