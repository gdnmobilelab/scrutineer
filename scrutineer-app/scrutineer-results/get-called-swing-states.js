

module.exports = function(statesCalled, swingStates) {
    return statesCalled.filter((stateCalledFipsCode) => {
        let isSwingState = swingStates.find((swingState) => {
            return swingState.fipsCode === stateCalledFipsCode
        });

        return isSwingState ? true : false;
    }).map((swingStateFipsCode) => {
        return swingStates.find((swingState) => {
            return swingState.fipsCode === swingStateFipsCode
        })
    });
};