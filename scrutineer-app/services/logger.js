var CONFIG = require('./../config');

module.exports = function() {
    if (CONFIG.DEBUG) {
        console.log(...arguments);
    }
};