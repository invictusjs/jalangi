var len = J$.readInput(0);
var threshold = 0;

function run(privateData) {
    var buf = J$.readInput([]);
    for (var i = 0; i < len; i++) {
        if (privateData[i] < threshold) {
            buf.push(0);
        } else {
            buf.push(1);
        }
    }

    return buf;
}

function branch() {
    var privateData1 = J$.readInput([]),
        privateData2 = J$.readInput([]);

    for (var i = 0; i < len; i++) {
        privateData1[i] = J$.readInput(0);
    }
    for (var i = 0; i < len; i++) {
        privateData2[i] = J$.readInput(0);
    }

    var buf1 = run(privateData1);
    var buf2 = run(privateData2);

    var ret;
    if (buf1.length == buf2.length) {
        ret = "OBLIVIOUS";
    } else {
        ret = "NOT_OBLIVIOUS";
    }

    return ret;
}

branch();
