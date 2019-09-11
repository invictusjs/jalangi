var len = 6;
var num_nodes = 3;
var nodes = []

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
        for (var j = i + 1; j < arr.length; j++) {
            if (arr[i] > arr[j])
                swap(arr, i, j);
        }
    }
}

function init_empty_nodes(tmp) {
    for (var i = 0; i < num_nodes; i++) {
        tmp.push([]);
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
    var dest;

    // Step 0: Input
    for (var i = 0; i < num_nodes; i++) {
        nodes.push([]);
        for (var j = 0; j < len; j++) {
            nodes[i].push(Math.floor(Math.random() * 10));
        }
    }
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();

    // Step 1: Local sort
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();

    // Step 2: Shuffle
    var temp_nodes = [];
    init_empty_nodes(temp_nodes);
    for (var i = 0; i < num_nodes; i++) {
        for (var j = 0; j < len; j++) {
            dest = j % num_nodes;
            temp_nodes[dest].push(nodes[i][j])
        }
    }
    nodes = temp_nodes;
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();


    // Step 3: Local sort
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();


    // Step 4: Shuffle
    temp_nodes = [];
    init_empty_nodes(temp_nodes);
    for (var i = 0; i < num_nodes; i++) {
        for (var j = 0; j < len; j++) {
            dest = Math.floor(j / Math.floor(len / num_nodes));
            temp_nodes[dest].push(nodes[i][j])
        }
    }
    nodes = temp_nodes;
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();


    // Step 5: Local sort
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();


    // Step 6: Shuffle (Shift)
    temp_nodes = [];
    init_empty_nodes(temp_nodes);
    for (var i = 0; i < num_nodes; i++) {
        for (var j = 0; j < len; j++) {
            dest = (i + Math.floor(j / Math.floor(len / 2))) % num_nodes;
            temp_nodes[dest].push(nodes[i][j])
        }
    }
    swap_half(temp_nodes[0])
    nodes = temp_nodes;
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();


    // Step 7: Local sort
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();


    // Step 8: Shuffle (Reverse Shift)
    temp_nodes = [];
    init_empty_nodes(temp_nodes);
    for (var i = 0; i < num_nodes; i++) {
        for (var j = 0; j < len; j++) {
            dest = ((i - (1 - Math.floor(j / Math.floor(len / 2)))) + num_nodes) % num_nodes;
            temp_nodes[dest].push(nodes[i][j])
        }
    }
    swap_half(temp_nodes[num_nodes - 1])
    swap_first_and_last_half(temp_nodes[0], temp_nodes[num_nodes - 1]);
    nodes = temp_nodes;
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();

    // Step 9: Local sort (Missing in the Opaque paper)
    for (var i = 0; i < num_nodes; i++) {
        local_sort(nodes[i]);
    }
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();

    // Step 10: Per-partition scan 1 & boundary processing
    for (var i = 0; i < num_nodes; i++) {
        var last_item = nodes[i][len -1];
        var count = 1;
        for (var j = len - 2; j >= 0; j--) {
            if (nodes[i][j] == last_item) {
                count += 1;
            } else {
                break;
            }
        }
        nodes[(i + 1) % num_nodes].push([last_item, count]);
    }
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();

    // Step 11: Per-partition scan 2
    for (var i = 0; i < num_nodes; i++) {
        if (nodes[i][0] == nodes[i][len][0])
            nodes[i][0] = [nodes[i][0], nodes[i][len][1] + 1];
        else
            nodes[i][0] = [nodes[i][0], 1];
        for (var j = 1; j < len; j++) {
            if (nodes[i][j - 1][0] == nodes[i][j])
                nodes[i][j] = [nodes[i][j], temp_nodes[i][j - 1][1] + 1];
            else
                nodes[i][j] = [nodes[i][j], 1];
        }
        nodes[i].length -= 1;
    }
    for (var i = 0; i < num_nodes; i++) {
        console.log(nodes[i]);
    }
    console.log();
}

run();
