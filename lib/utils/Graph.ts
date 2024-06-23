import { HeuristicEnum } from "@/lib/types/enum";

class Graph {
  private _rows: number;

  private _cols: number;

  private _allowDiagonal: boolean;

  private _grid: number[][];

  constructor(rows: number, cols: number, allowDiagonal: boolean = false) {
    this._rows = rows;
    this._cols = cols;
    this._allowDiagonal = allowDiagonal;
    this._grid = [];
  }

  get rows(): number {
    return this._rows;
  }

  get cols(): number {
    return this._cols;
  }

  get allowDiagonal(): boolean {
    return this._allowDiagonal;
  }

  set allowDiagonal(value: boolean) {
    this._allowDiagonal = value;
  }

  get grid(): number[][] {
    return this._grid;
  }

  static fromGrid(grid: number[][], allowDiagonal: boolean = false): Graph {
    const rows = grid.length;
    const cols = grid[0].length;
    const graph = new Graph(rows, cols, allowDiagonal);
    graph._grid = grid;
    return graph;
  }

  initializeGrid(value: number = 1): void {
    if (![0, 1].includes(value)) {
      throw new Error("Grid can only contain 0 or 1");
    }
    this._grid = Array(this.rows)
      .fill(0)
      .map(() => Array(this.cols).fill(value));
  }

  blockNode(node: [number, number]): void {
    let [r, c] = node;
    if (r < 0) r = this.rows + r;
    if (c < 0) c = this.cols + c;
    if (!this.isInGrid([r, c])) throw new Error("Invalid position");
    this._grid[r][c] = 0;
  }

  unblockNode(node: [number, number]): void {
    let [r, c] = node;
    if (r < 0) r = this.rows + r;
    if (c < 0) c = this.cols + c;
    if (!this.isInGrid([r, c])) throw new Error("Invalid position");
    this._grid[r][c] = 1;
  }

  isBlocked(node: [number, number]): boolean {
    const [r, c] = node;
    if (!this.isInGrid(node)) return true;
    return this._grid[r][c] === 0;
  }

  isInGrid(node: [number, number]): boolean {
    const [r, c] = node;
    return 0 <= r && r < this.rows && 0 <= c && c < this.cols;
  }

  getAllNeighbors(node: [number, number]): [number, number][] {
    const [r, c] = node;
    const neighbors: [number, number][] = [];
    let directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const diagonalDirections = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
    if (this._allowDiagonal) {
      directions = directions.concat(diagonalDirections);
    }
    for (const direction of directions) {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const [r_i, c_i] = direction;
      if (!this._allowDiagonal) {
        if (Math.abs(r_i + c_i) != 1) {
          continue;
        }
      }
      if (!this.isInGrid([r + r_i, c + c_i])) {
        continue;
      }
      if (!this.grid[r + r_i][c + c_i]) {
        continue;
      }
      neighbors.push([r + r_i, c + c_i]);
    }
    return neighbors;
  }

  getNeighbors(node: [number, number]): [number, number][] {
    const [r, c] = node;
    const neighbors: [number, number][] = [];
    let directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    const diagonalDirections = [
      [-1, -1],
      [-1, 1],
      [1, -1],
      [1, 1],
    ];
    if (this._allowDiagonal) {
      directions = directions.concat(diagonalDirections);
    }
    for (const direction of directions) {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const [r_i, c_i] = direction;
      if (!this._allowDiagonal) {
        if (Math.abs(r_i + c_i) != 1) {
          continue;
        }
      }
      if (!this.isInGrid([r + r_i, c + c_i])) {
        continue;
      }
      if (!this.grid[r + r_i][c + c_i]) {
        continue;
      }
      if (this._allowDiagonal) {
        if (Math.abs(r_i) + Math.abs(c_i) == 2) {
          if (this.isBlocked([r, c + c_i]) && this.isBlocked([r + r_i, c])) {
            continue;
          }
        }
      }
      neighbors.push([r + r_i, c + c_i]);
    }
    return neighbors;
  }

  crossesPath(
    nodeFrom: [number, number],
    nodeTo: [number, number],
    visited: number[][],
  ): boolean {
    if (!this.allowDiagonal) {
      return false;
    }

    const [rF, cF] = nodeFrom;
    const [rT, cT] = nodeTo;

    const dR = rT - rF;
    const dC = cT - cF;

    const crosses1 = visited[rF + dR][cF] == 1;
    const crosses2 = visited[rF][cF + dC] == 1;

    return crosses1 && crosses2;
  }

  static distance(
    nodeA: [number, number],
    nodeB: [number, number],
    method: HeuristicEnum,
  ): number {
    const [rA, cA] = nodeA;
    const [rB, cB] = nodeB;

    const dR = Math.abs(rB - rA);
    const dC = Math.abs(cB - cA);

    switch (method) {
      case HeuristicEnum.Euclidean:
        return Math.pow(Math.pow(dR, 2) + Math.pow(dC, 2), 0.5);
      case HeuristicEnum.Chebyshev:
        return Math.max(dR, dC);
      default:
        return dR + dC;
    }
  }

  pathExists(start: [number, number], target: [number, number]): boolean {
    const visited = Array(this.rows)
      .fill(0)
      .map(() => Array(this.cols).fill(0));
    visited[start[0]][start[1]] = 1;
    const stack: [number, number][] = [start];

    let isAvailable = false;

    while (stack.length) {
      const curNode = stack[stack.length - 1];
      if (JSON.stringify(curNode) == JSON.stringify(target)) {
        return true;
      }

      isAvailable = false;
      for (const neighbor of this.getNeighbors(curNode!)) {
        if (!visited[neighbor[0]][neighbor[1]]) {
          if (!this.crossesPath(curNode!, neighbor, visited)) {
            visited[neighbor[0]][neighbor[1]] = 1;
            stack.push(neighbor);
            isAvailable = true;
            break;
          }
        }
      }
      if (!isAvailable) {
        stack.pop();
      }
    }
    return false;
  }
}

export default Graph;
