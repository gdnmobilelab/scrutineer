
module.exports = function(presidentialResults) {
    return Object.keys(presidentialResults).reduce((coll, fipsCode) => {
        //If it's not a state or it's the US rollup, return
        if (fipsCode.length > 2 || fipsCode === 'US') {
            return coll;
        }

        //If we don't have a winner, return
        if(!presidentialResults[fipsCode].results.find((candidate) => candidate.winner)) {
            return coll;
        }

        //Add the state to the statesCalled
        return coll.concat([fipsCode]);
    }, [])
}