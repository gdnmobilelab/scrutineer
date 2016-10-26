const db = require('./db');
const assert = require('chai').assert;

describe('db', function() {
    describe('getActiveDate', function() {
        it('should return the currently active date', function() {
            assert.equal(db.getActiveDate(), '2016-10-12T18:39:23.338Z');
        });
    });
});