var dataLen = 5;
var cacheLineLen = 5;

function run(privateData) {
    var cacheLines = [];
    var trace = J$.readInput([]);
    var nextAvailableCache = [];
    var dummySlot = -1;

    for (var i = 0; i < cacheLineLen; i++) {
        cacheLines[i] = [];
        nextAvailableCache[i] = 0;
    }

    for (var i = 0; i < cacheLineLen; i++) {
        for (var j = 0; j < dataLen; j++) {
            var x = J$.readInput(0);
            if (x * cacheLineLen + i == privateData[j]) {
                cacheLines[i][nextAvailableCache[i]] = privateData[i];
                nextAvailableCache[i] += 1;
                trace.push(i);
            } else {
                cacheLines[i][dummySlot] = privateData[i];
                trace.push(i);
            }
        }
    }

    return trace;
}

function traceEqual(a, b) {
    var ret = true;
    if (a.length !== b.length)
        ret = false;
    for (var i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            ret = false;
    }
    return ret;
}

function hash_construction() {
    var privateData1 = [],
        privateData2 = [];

    for (var i = 0; i < dataLen; i++) {
        privateData1[i] = J$.readInput(0);
    }
    for (var i = 0; i < dataLen; i++) {
        privateData2[i] = J$.readInput(0);
    }

    var trace1 = run(privateData1);
    var trace2 = run(privateData2);

    var ret;
    if (traceEqual(trace1, trace2)) {
        ret = "OBLIVIOUS";
    } else {
        ret = "NOT_OBLIVIOUS";
    }
    return ret;
}

hash_construction();
