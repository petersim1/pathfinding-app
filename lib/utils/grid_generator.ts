import { HeuristicEnum } from "../types/enum";
import Graph from "./Graph";
import { shuffle, nestedArrayContains } from "../helpers";

export const randomGridFromPath = (
  graph: Graph,
  percentBlockage: number = 0.4,
): [number, number][] => {
  const generateViablePath = (): [number, number][] => {
    const start: [number, number] = [
      Math.floor(Math.random() * graph.rows),
      Math.floor(Math.random() * graph.cols),
    ];

    const minAllowableDistance =
      Math.round(graph.rows / 2) + Math.round(graph.cols / 2);

    let curDistance = 0;
    let isAvailable = false;
    const visited = Array(graph.rows)
      .fill(0)
      .map(() => Array(graph.cols).fill(0));
    visited[start[0]][start[1]] = 1;
    const stack: [number, number][] = [];
    stack.push(start);

    while (stack.length) {
      const curNode = stack[stack.length - 1];
      curDistance = Graph.distance(start, curNode!, HeuristicEnum.Manhattan);

      if (curDistance >= minAllowableDistance) {
        if (Math.random() < 0.75) {
          break;
        }
      }

      isAvailable = false;
      const neighbors = graph.getNeighbors(curNode!);
      shuffle(neighbors);

      for (const neighbor of neighbors) {
        if (!visited[neighbor[0]][neighbor[1]]) {
          if (!graph.crossesPath(curNode!, neighbor, visited)) {
            stack.push(neighbor);
            visited[neighbor[0]][neighbor[1]] = 1;
            isAvailable = true;
            break;
          }
        }
      }
      if (!isAvailable) {
        if (curDistance >= minAllowableDistance) {
          break;
        }
        stack.pop();
      }
    }
    return stack;
  };

  if (graph.rows < 4) throw Error("Too few rows");
  if (graph.cols < 4) throw Error("Too few cols");

  const percentBlocked = Math.max(0, Math.min(1, percentBlockage));

  const path = generateViablePath();
  graph.initializeGrid(0);
  for (const node of path) {
    graph.unblockNode(node);
  }

  for (let r = 0; r < graph.rows; r++) {
    for (let c = 0; c < graph.cols; c++) {
      if (!nestedArrayContains(path, [r, c])) {
        if (Math.random() > percentBlocked) {
          graph.unblockNode([r, c]);
        }
      }
    }
  }

  return [path[0], path[path.length - 1]];
};

export const randomGrid = (
  graph: Graph,
  percentBlockage: number = 0.4,
): [number, number][] => {
  if (graph.rows < 4) throw Error("Too few rows");
  if (graph.cols < 4) throw Error("Too few cols");

  const percentBlocked = Math.max(0, Math.min(1, percentBlockage));

  const availableRow = Array.from({ length: graph.rows }).map((_, i) => i);
  const availableCol = Array.from({ length: graph.cols }).map((_, i) => i);

  const startR = Math.floor(Math.random() * graph.rows);
  const startC = Math.floor(Math.random() * graph.cols);

  availableRow.splice(startR, 1);
  availableCol.splice(startC, 1);

  const endR = availableRow[Math.floor(Math.random() * (graph.rows - 1))];
  const endC = availableCol[Math.floor(Math.random() * (graph.cols - 1))];

  const start: [number, number] = [startR, startC];
  const end: [number, number] = [endR, endC];

  for (let r = 0; r < graph.rows; r++) {
    for (let c = 0; c < graph.cols; c++) {
      if (r == startR && c == startC) continue;
      if (r == endR && c == endC) continue;
      if (Math.random() < percentBlocked) {
        graph.blockNode([r, c]);
        const validPath = graph.pathExists(start, end);
        if (!validPath) {
          graph.unblockNode([r, c]);
        }
      }
    }
  }

  return [start, end];
};
