import random

num_of_nodes = 3
elems_per_node = 6

nodes = []
shuffles = None

def send_to(dst, data):
    shuffles[dst].append(data)

def local_sort():
    for node in nodes:
        node.sort()

def print_nodes():
    for node in nodes:
        print(node)

def local_label():
    for node in nodes:
        for i in range(len(node)):
            node[i] = (node[i] // 10, 1)

## 1. Oblivious Sort

# Step 0: Input
for _ in range(num_of_nodes):
    nodes.append(random.sample(range(100), elems_per_node))

local_label()

# Step 1: Local sort
local_sort()

# Step 2: Shuffle (Transpose)
shuffles = [[] for _ in range(num_of_nodes)]
for node in nodes:
    for i in range(len(node)):
        send_to(i % num_of_nodes, node[i])
nodes = shuffles

# Step 3: Local sort
local_sort()

# Step 4: Shuffle (Untranspose)
shuffles = [[] for _ in range(num_of_nodes)]
for node in nodes:
    for i in range(len(node)):
        send_to(i // (elems_per_node // num_of_nodes), node[i])
nodes = shuffles


# Step 5: Local sort
local_sort()

# Step 6: Shuffle (Shift)
shuffles = [[] for _ in range(num_of_nodes)]
for node_idx, node in enumerate(nodes):
    for elem_idx in range(len(node)):
        send_to((node_idx + elem_idx // (elems_per_node // 2)) % num_of_nodes, node[elem_idx])
nodes = shuffles

# Step 7: Local sort
local_sort()

# Step 8: Shuffle (Unshift)
shuffles = [[] for _ in range(num_of_nodes)]
for val in nodes[0][0:(elems_per_node // 2)]:
    send_to(0, val)
for node_idx, node in enumerate(nodes[1:]):
    node_idx += 1
    for elem_idx in range(len(node)):
        send_to(node_idx - (1 - elem_idx // (elems_per_node // 2)), node[elem_idx])
for val in nodes[0][(elems_per_node // 2):]:
    send_to(num_of_nodes - 1, val)
nodes = shuffles
local_sort()

print_nodes()

## 2. Per-Node Scan
stats = []
for node in nodes:
    stat = node[len(node) - 1]
    for i in reversed(range(len(node) - 1)):
        if stat[0] == node[i][0]:
            stat = (stat[0], stat[1] + 1)
    stats.append(stat)

## 3. Boundary Processing
shuffles = [[] for _ in range(num_of_nodes)]
for node_idx, node in enumerate(nodes):
    boundary_stat = (None, 0)
    for stat in stats:
        if stat[0] == stats[node_idx][0]:
            boundary_stat = (stat[0], boundary_stat[1] + stat[1])
    send_to((node_idx + 1) % num_of_nodes, boundary_stat)

## 4. Per-Node Scan
for node_idx, node in enumerate(nodes):
    #node[0] = (node[0][0], shuffles[node_idx][1] + 1 if shuffles[node_idx][0] == node[0] else 1)
    for i in range(1, len(node)):
        if node[i][0] == node[i - 1][0]:
            node[i] = (node[i][0], node[i - 1][1] + node[i][1])
            node[i -1] = (node[i][0], -1)

print_nodes()
