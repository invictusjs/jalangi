var dataLen = J$.readInput(0);
var cacheLineLen = J$.readInput(0);

function run(privateData) {
    var cacheLines = J$.readInput([]);
    var trace = J$.readInput([]);
    var nextAvailableCache = J$.readInput([]);
    var dummySlot = -1;

    for (var i = 0; i < cacheLineLen; i++) {
        cacheLines[i] = J$.readInput([]);
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
    for (var x = 0; x < a.length; x++) {
        if (a[x] !== b[x])
            ret = false;
    }
    return ret;
}

function hash_construction() {
    var privateData1 = J$.readInput([]),
        privateData2 = J$.readInput([]);

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
