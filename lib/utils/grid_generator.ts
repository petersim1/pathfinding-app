import Graph from "./Graph";

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
