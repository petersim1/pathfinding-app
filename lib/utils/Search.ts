import { GeneratorFinderI } from "../types";
import { HeuristicEnum, YieldEnum } from "../types/enum";
import Graph from "./Graph";
import PriorityQueue from "./Queue";

const recreatePathFromParents = (
  target: [number, number],
  parents: Record<string, [number, number] | null>,
): [number, number][] => {
  const path: [number, number][] = [];
  let node: [number, number] | null = target;
  while (node !== null) {
    path.unshift(node);
    node = parents[JSON.stringify(node)] as [number, number] | null;
  }

  return path;
};

const recreatePathFromStack = (
  stack: [number, number][],
): [number, number][] => {
  return stack.toReversed();
};

export function* bfs(
  start: [number, number],
  target: [number, number],
  graph: Graph,
): GeneratorFinderI {
  const visited = Array(graph.rows)
    .fill(0)
    .map(() => Array(graph.cols).fill(0));
  visited[start[0]][start[1]] = 1;

  const queue = [start];
  const parents: Record<string, [number, number] | null> = {
    [JSON.stringify(start)]: null,
  };
  let isValidPath = false;

  while (queue.length) {
    const curNode = queue.shift();
    yield { status: YieldEnum.SEARCH, data: curNode! };
    if (JSON.stringify(curNode) == JSON.stringify(target)) {
      isValidPath = true;
      break;
    }

    for (const neighbor of graph.getNeighbors(curNode!)) {
      if (!visited[neighbor[0]][neighbor[1]]) {
        visited[neighbor[0]][neighbor[1]] = 1;
        queue.push(neighbor);
        parents[JSON.stringify(neighbor)] = curNode!;
      }
    }
  }

  if (isValidPath) {
    const path = recreatePathFromParents(target, parents);
    yield { status: YieldEnum.PATH, data: path };
  } else {
    yield { status: YieldEnum.ERROR, data: null };
  }
}

export function* dfs(
  start: [number, number],
  target: [number, number],
  graph: Graph,
): GeneratorFinderI {
  const visited = Array(graph.rows)
    .fill(0)
    .map(() => Array(graph.cols).fill(0));
  visited[start[0]][start[1]] = 1;

  const stack = [start];
  let isValidPath = false;
  let isAvailable = false;

  while (stack.length) {
    const curNode = stack[stack.length - 1];
    yield { status: YieldEnum.SEARCH, data: curNode };

    if (JSON.stringify(curNode) == JSON.stringify(target)) {
      isValidPath = true;
      break;
    }

    isAvailable = false;
    for (const neighbor of graph.getNeighbors(curNode!)) {
      if (!visited[neighbor[0]][neighbor[1]]) {
        visited[neighbor[0]][neighbor[1]] = 1;
        stack.push(neighbor);
        isAvailable = true;
        break;
      }
    }
    if (!isAvailable) {
      stack.pop();
    }
  }

  if (isValidPath) {
    const path = recreatePathFromStack(stack);
    yield { status: YieldEnum.PATH, data: path };
  } else {
    yield { status: YieldEnum.ERROR, data: null };
  }
}

export function* dfsHeuristic(
  start: [number, number],
  target: [number, number],
  graph: Graph,
  heuristic: HeuristicEnum,
): GeneratorFinderI {
  const visited = Array(graph.rows)
    .fill(0)
    .map(() => Array(graph.cols).fill(0));
  const values = structuredClone(visited);
  visited[start[0]][start[1]] = 1;
  values[start[0]][start[1]] = Graph.distance(start, target, heuristic);

  const stack = [start];
  let isValidPath = false;
  let isAvailable = false;

  while (stack.length) {
    const curNode = stack[stack.length - 1];
    yield { status: YieldEnum.SEARCH, data: curNode };

    if (JSON.stringify(curNode) == JSON.stringify(target)) {
      isValidPath = true;
      break;
    }

    const toSearch = [];
    const neighbors = graph.getNeighbors(curNode!);
    for (const neighbor of neighbors) {
      if (!visited[neighbor[0]][neighbor[1]]) {
        values[neighbor[0]][neighbor[1]] = Graph.distance(
          neighbor,
          target,
          heuristic,
        );
      }
      toSearch.push([values[neighbor[0]][neighbor[1]], neighbor]);
    }
    const toSearchSorted = toSearch.toSorted((a, b) => a[0] - b[0]);

    isAvailable = false;
    for (const neighborArr of toSearchSorted) {
      const [, neighbor] = neighborArr;
      if (!visited[neighbor[0]][neighbor[1]]) {
        visited[neighbor[0]][neighbor[1]] = 1;
        stack.push(neighbor);
        isAvailable = true;
        break;
      }
    }
    if (!isAvailable) {
      stack.pop();
    }
  }

  if (isValidPath) {
    const path = recreatePathFromStack(stack);
    yield { status: YieldEnum.PATH, data: path };
  } else {
    yield { status: YieldEnum.ERROR, data: null };
  }
}

export function* gbfs(
  start: [number, number],
  target: [number, number],
  graph: Graph,
  heuristic: HeuristicEnum,
): GeneratorFinderI {
  const visited = Array(graph.rows)
    .fill(0)
    .map(() => Array(graph.cols).fill(0));
  visited[start[0]][start[1]] = 1;

  const queue = new PriorityQueue();
  queue.enqueue(start, 0);
  const parents: Record<string, [number, number] | null> = {
    [JSON.stringify(start)]: null,
  };
  let isValidPath = false;

  while (!queue.isEmpty()) {
    const { element: curNode } = queue.dequeue();
    yield { status: YieldEnum.SEARCH, data: curNode! };
    if (JSON.stringify(curNode) == JSON.stringify(target)) {
      isValidPath = true;
      break;
    }

    for (const neighbor of graph.getNeighbors(curNode!)) {
      if (!visited[neighbor[0]][neighbor[1]]) {
        const distance = Graph.distance(neighbor, target, heuristic);
        visited[neighbor[0]][neighbor[1]] = 1;
        queue.enqueue(neighbor, distance);
        parents[JSON.stringify(neighbor)] = curNode!;
      }
    }
  }

  if (isValidPath) {
    const path = recreatePathFromParents(target, parents);
    yield { status: YieldEnum.PATH, data: path };
  } else {
    yield { status: YieldEnum.ERROR, data: null };
  }
}

export function* astar(
  start: [number, number],
  target: [number, number],
  graph: Graph,
  heuristic: HeuristicEnum,
): GeneratorFinderI {
  const visited = Array(graph.rows)
    .fill(0)
    .map(() => Array(graph.cols).fill(0));
  const gCosts = structuredClone(visited);
  visited[start[0]][start[1]] = 1;

  const queue = new PriorityQueue();
  queue.enqueue(start, 0);
  const parents: Record<string, [number, number] | null> = {
    [JSON.stringify(start)]: null,
  };
  let isValidPath = false;

  while (!queue.isEmpty()) {
    const { element: curNode } = queue.dequeue();
    yield { status: YieldEnum.SEARCH, data: curNode! };
    if (JSON.stringify(curNode) == JSON.stringify(target)) {
      isValidPath = true;
      break;
    }
    // const gCost = gCosts[curNode[0]][curNode[1]] + 1;

    for (const neighbor of graph.getNeighbors(curNode!)) {
      const gCost =
        gCosts[curNode[0]][curNode[1]] +
        Graph.distance(curNode, neighbor, heuristic);
      if (
        !visited[neighbor[0]][neighbor[1]] ||
        gCost < gCosts[neighbor[0]][neighbor[1]]
      ) {
        const hCost = Graph.distance(neighbor, target, heuristic);
        const fCost = gCost + hCost;
        visited[neighbor[0]][neighbor[1]] = 1;
        queue.enqueue(neighbor, fCost);
        parents[JSON.stringify(neighbor)] = curNode!;
        gCosts[neighbor[0]][neighbor[1]] = gCost;
      }
    }
  }

  if (isValidPath) {
    const path = recreatePathFromParents(target, parents);
    yield { status: YieldEnum.PATH, data: path };
  } else {
    yield { status: YieldEnum.ERROR, data: null };
  }
}

export function* jps(
  start: [number, number],
  target: [number, number],
  graph: Graph,
  heuristic: HeuristicEnum,
): GeneratorFinderI {
  const canEnter = (pos: [number, number]): boolean => {
    return graph.isInGrid(pos) && !graph.isBlocked(pos);
  };

  const jump = (
    nodeFrom: [number, number],
    node: [number, number],
    scanned: [number, number][] = [],
  ): [[number, number] | null, [number, number][]] => {
    const [r, c] = node;
    const [dr, dc] = [r - nodeFrom[0], c - nodeFrom[1]];

    if (!canEnter(node)) {
      return [null, scanned];
    }

    if (JSON.stringify(node) === JSON.stringify(target)) {
      return [node, scanned];
    }

    if (dr !== 0) {
      if (
        (canEnter([r, c - 1]) && !canEnter([r - dr, c - 1])) ||
        (canEnter([r, c + 1]) && !canEnter([r - dr, c + 1]))
      ) {
        return [node, scanned];
      }
      const [vert0, vert0s] = jump([r, c + 1], node, scanned);
      const [vert1, vert1s] = jump([r, c - 1], node, scanned);
      if (vert0 !== null || vert1 !== null) {
        return [node, [...new Set([...vert1s, ...vert0s])]];
      }
    }

    if (dc !== 0) {
      if (
        (canEnter([r - 1, c]) && !canEnter([r - 1, c - dc])) ||
        (canEnter([r + 1, c]) && !canEnter([r + 1, c - dc]))
      ) {
        return [node, scanned];
      }
    }

    return jump(node, [r + dr, c + dc], [...scanned, node]);
  };

  const openList = new PriorityQueue();
  openList.enqueue(start, 0);
  const parents: Record<string, [number, number] | null> = {
    [JSON.stringify(start)]: null,
  };
  const gScore: Record<string, number> = {
    [JSON.stringify(start)]: 0,
  };

  let isValidPath = false;

  while (!openList.isEmpty()) {
    const current = openList.dequeue().element;
    yield { status: YieldEnum.SEARCH, data: current };

    if (JSON.stringify(current) === JSON.stringify(target)) {
      isValidPath = true;
      break;
    }

    const tentativeGScore = gScore[JSON.stringify(current)] + 1;

    for (const neighbor of graph.getNeighbors(current)) {
      const [jp, scanned] = jump(current, neighbor);
      for (const s of scanned) {
        yield { status: YieldEnum.SCAN, data: s };
      }
      if (jp === null) {
        continue;
      }
      if (
        !(JSON.stringify(jp) in gScore) ||
        tentativeGScore < gScore[JSON.stringify(jp)]
      ) {
        parents[JSON.stringify(jp)] = current;
        gScore[JSON.stringify(jp)] = tentativeGScore;
        const fScore = tentativeGScore + Graph.distance(jp, target, heuristic);
        openList.enqueue(jp, fScore);
      }
    }
  }

  if (isValidPath) {
    const path = recreatePathFromParents(target, parents);
    yield { status: YieldEnum.PATH, data: path };
  } else {
    yield { status: YieldEnum.ERROR, data: null };
  }
}
