import random

num_of_nodes = 3
elems_per_node = 6

nodes = []

def local_sort():
    for node in nodes:
        node.sort()

def print_nodes():
    for node in nodes:
        print(node)

# Step 0: Input
for _ in range(num_of_nodes):
    nodes.append(random.sample(range(100), elems_per_node))

# Step 1: Local sort
local_sort()

# Step 2: Shuffle (Transpose)
shuffles = [[] for _ in range(num_of_nodes)]
for node in nodes:
    for idx, val in enumerate(node):
        shuffles[idx % num_of_nodes].append(val)
nodes = shuffles

# Step 3: Local sort
local_sort()

# Step 4: Shuffle (Untranspose)
shuffles = [[] for _ in range(num_of_nodes)]
for node in nodes:
    for idx, val in enumerate(node):
        shuffles[idx // (elems_per_node // num_of_nodes)].append(val)
nodes = shuffles

# Step 5: Local sort
local_sort()

# Step 6: Shuffle (Shift)
shuffles = [[] for _ in range(num_of_nodes)]
for node_idx, node in enumerate(nodes):
    for elem_idx, val in enumerate(node):
        shuffles[(node_idx + elem_idx // (elems_per_node // 2)) % num_of_nodes].append(val)
nodes = shuffles

# Step 7: Local sort
local_sort()

# Step 8: Shuffle (Unshift)
shuffles = [[] for _ in range(num_of_nodes)]
for val in nodes[0][0:(elems_per_node // 2)]:
    shuffles[0].append(val)
for node_idx, node in enumerate(nodes[1:]):
    node_idx += 1
    for elem_idx, val in enumerate(node):
        shuffles[node_idx - (1 - elem_idx // (elems_per_node // 2))].append(val)
for val in nodes[0][(elems_per_node // 2):]:
    shuffles[num_of_nodes - 1].append(val)
nodes = shuffles
local_sort()

print_nodes()
