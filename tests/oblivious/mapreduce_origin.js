var num_mappers = 3;
var num_reducers = 3;
var len = 6;
var CONST_MAX = 100;

function run() {
    var reducers = [];
    var traces = [];
    var node = [];
    var max = 0;
    var dummy = -1;

    for (var i = 0; i < num_mappers; i++) {
        node[i] = [];
        for (var j = 0; j < len; j++) {
            node[i][j] = J$.readInput(0);
        }
    }

    for (var i = 0; i < num_mappers; i++) {
        traces[i] = [];
        for (var j = 0; j < num_reducers; j++) {
            traces[i][j] = 0;
        }
    }

    for (var i = 0; i < num_reducers; i++) {
        reducers[i] = J$.readInput([]);
    }

    for (var i = 0; i < num_mappers; i++) {
        for (var j = 0; j < len; j++) {
            for (var k = 0; k < num_reducers; k++) {
                var x = J$.readInput(0);
                if (x * num_reducers + k == node[i][j]) {
                    reducers[k].push(node[i][j]);
                    traces[i][k] += 1;
                    if (max < traces[i][k]) {
                        max = traces[i][k]
                    }
                }
            }
        }
    }

    //for (var i = 0; i < num_mappers; i++) {
        //for (var j = 0; j < num_reducers; j++) {
            //while (traces[i][j] < max) {
                //reducers[j].push(dummy);
                //traces[i][j] += 1;
            //}
        //}
    //}

    //for (var i = 0; i < num_mappers; i++) {
        //for (var j = 0; j < num_reducers; j++) {
            //traces[i][j] = CONST_MAX;
        //}
    //}

    return traces;
}

function traceEqual(a, b) {
    var ret = true;
    for (var i = 0; i < num_mappers; i++) {
        for (var j = 0; j < num_reducers; j++) {
            if (a[i][j] != b[i][j])
                ret = false;
        }
    }
    return ret;
}

function mapreduce() {
    var trace1 = run();
    var trace2 = run();

    var ret;
    if (traceEqual(trace1, trace2)) {
        ret = "OBLIVIOUS";
    } else {
        ret = "NOT_OBLIVIOUS";
    }

    return ret;
}

mapreduce();
