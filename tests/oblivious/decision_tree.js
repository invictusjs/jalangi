var layerLen = 5;

function run(privateData) {
    var layers = [];
    var trace = J$.readInput([]);

    for (var i = 0; i < layerLen; i++) {
        layers[i] = [];
        for (var j = 0; j < 32; j++) {
            layers[i][j] = J$.readInput(0);
        }
    }

    var cur = 0;
    var found;
    for (var i = 0; i < layerLen; i++) {
        if (privateData < layers[i][cur]) {
            cur = cur * 2;
        } else if (privateData > layers[i][cur]) {
            cur = cur * 2 + 1;
        } else {
            found = cur;
            cur = cur * 2;
        }
        trace.push(i);
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

function predict() {
    var privateData1 = J$.readInput(0),
        privateData2 = J$.readInput(0);

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

predict();
