var len = J$.readInput(0);
var num_nodes = J$.readInput(0);

function swap(arr, i, j) {
    var temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
}

function swap2(arr1, i, arr2, j) {
    var temp = arr1[i];
    arr1[i] = arr2[j];
    arr2[j] = temp;
}

function local_sort(arr) {
    for (var i = 0; i < arr.length - 1; i++) {
        for (var j = 0; j < arr.length; j++) {
            if (arr[i] > arr[j])
                swap(arr, i, j);
        }
    }
}

function init_empty_nodes(tmp) {
    for (var i = 0; i < num_nodes; i++) {
        tmp.push(J$.readInput([]));
    }
}

function swap_half(arr) {
    for (var i = 0; i < arr.length / 2; i++) {
        swap(arr, i, i + arr.length / 2);
    }
}
function swap_first_and_last_half(first, last) {
    for (var i = 0; i < first.length / 2; i++) {
        swap2(first, i, last, i + first.length / 2);
    }
}

function run() {
    var nodes = J$.readInput([]);
    var trace = J$.readInput([]);
    var dest;

    // Step 0: Input
    for (var i = 0; i < num_nodes; i++) {
        nodes.push(J$.readInput([]));
        for (var j = 0; j < len; j++) {
            nodes[i].push(J$.readInput(0));
        }
    }

    // Step 1: Local sort
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }

    // Step 2: Shuffle
    var temp_nodes = J$.readInput([]);
    init_empty_nodes(temp_nodes);
    for (var i = 0; i < num_nodes; i++) {
        for (var j = 0; j < len; j++) {
            //dest = j % num_nodes;
            dest = J$.readInput(0);
            temp_nodes[dest].push(nodes[i][j])
            trace.push([i, dest, 1]);
        }
    }
    nodes = temp_nodes;

    // Step 3: Local sort
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }

    // Step 4: Shuffle
    temp_nodes = J$.readInput([]);
    init_empty_nodes(temp_nodes);
    for (var i = 0; i < num_nodes; i++) {
        for (var j = 0; j < len; j++) {
            //dest = Math.floor(j / Math.floor(len / num_nodes));
            dest = J$.readInput(0);
            temp_nodes[dest].push(nodes[i][j]);
            trace.push([i, dest, 1]);
        }
    }
    nodes = temp_nodes;

    // Step 5: Local sort
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }

    // Step 6: Shuffle (Shift)
    temp_nodes = J$.readInput([]);
    init_empty_nodes(temp_nodes);
    for (var i = 0; i < num_nodes; i++) {
        for (var j = 0; j < len; j++) {
            if (nodes[i][j] > 0) {
                //dest = (i + Math.floor(j / Math.floor(len / 2))) % num_nodes;
                dest = J$.readInput(0);
                temp_nodes[dest].push(nodes[i][j]);
                trace.push([i, dest, 1]);
            }
        }
    }
    //swap_half(temp_nodes[0])
    nodes = temp_nodes;

    // Step 7: Local sort
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }

    // Step 8: Shuffle (Reverse Shift)
    temp_nodes = J$.readInput([]);
    init_empty_nodes(temp_nodes);
    for (var i = 0; i < num_nodes; i++) {
        for (var j = 0; j < len; j++) {
            //dest = ((i - (1 - Math.floor(j / Math.floor(len / 2)))) + num_nodes) % num_nodes;
            dest = J$.readInput(0);
            temp_nodes[dest].push(nodes[i][j]);
            trace.push([i, dest, 1]);
        }
    }
    //swap_half(temp_nodes[num_nodes - 1])
    //swap_first_and_last_half(temp_nodes[0], temp_nodes[num_nodes - 1]);
    nodes = temp_nodes;

    // Step 9: Local sort (Missing in the Opaque paper)
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }

    return trace;
}

function obl_sort() {
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

obl_sort();
