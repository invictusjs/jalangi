var num_mappers = 2;
var num_reducers = 2;
var len = 3;

function run() {
    var reducers = [];
    var trace = J$.readInput([]);
    var node = [];
    var max = 0;
    var dummy = -1;

    for (var i = 0; i < num_mappers; i++) {
        node[i] = [];
        for (var j = 0; j < len; j++) {
            node[i][j] = J$.readInput(0);
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
                    if (max < reducers[k].length) {
                        max = reducers[k].length
                    }
                }
            }
        }
    }

    for (var i = 0; i < num_mappers; i++) {
        for (var j = 0; j < num_reducers; j++) {
            trace.push([i, j, max]);
        }
    }

    //for (var i = 0; i < num_mappers; i++) {
        //for (var j = 0; j < num_reducers; j++) {
            //traces[i][j] = CONST_MAX;
        //}
    //}

    return trace;
}

function mapreduce() {
    var trace1 = run();
    var trace2 = run();

    var ret = "OBLIVIOUS";
    for (var i = 0; i < trace1.length; ++i) {
        for (var j = 0; j < 3; ++j) {
            if (trace1[i] !== undefined && trace2[i] !== undefined && trace1[i][j] != trace2[i][j]) {
                ret = "NOT_OBLIVIOUS";
            }
        }
    }
    return ret;
}

mapreduce();
