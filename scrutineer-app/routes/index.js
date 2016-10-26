var express = require('express');
var router = express.Router();
const CONFIG = require('../config');

router.get('/', function(req, res, next) {
    res.render('index', {
        CONFIG: JSON.stringify(Object.assign({}, CONFIG.PUBLIC, {
            SWING_STATES: CONFIG.SWING_STATES
        }))
    })
});

router.get('/dashboard', function(req, res, next) {
    res.render('dashboard', {
        CONFIG: JSON.stringify(Object.assign({}, CONFIG.PUBLIC, {
            SWING_STATES: CONFIG.SWING_STATES
        }))
    })
});


module.exports = router;
