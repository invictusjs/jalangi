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
        out = []
        for i in range(len(node)):
            if node[i] < 50:
                out.append((0, node[i]))
            else:
                out.append((1, node[i]))

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
