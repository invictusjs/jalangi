var num_mappers = J$.readInput(0);
var num_reducers = J$.readInput(0);
var len = J$.readInput(0);

function run() {
    var reducers = J$.readInput([]);
    var trace = J$.readInput([]);
    var node = J$.readInput([]);
    var max = 0;
    var dummy = -1;

    for (var i = 0; i < num_mappers; i++) {
        node[i] = J$.readInput([]);
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
    for (var x = 0; x < trace1.length; ++x) {
        if (trace1[x] !== undefined && trace2[x] !== undefined &&
            (trace1[x][0] != trace2[x][0] || trace1[x][1] != trace2[x][1] || trace1[x][2] != trace2[x][2])) {
            ret = "NOT_OBLIVIOUS";
        }
    }

    return ret;
}

mapreduce();
