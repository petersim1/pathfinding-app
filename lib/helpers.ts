import { FinderInputOptions } from "./types";
import { HeuristicEnum, MethodEnum, YieldEnum } from "./types/enum";
import Graph from "./utils/Graph";
import * as Search from "./utils/Search";

export const cn = (...args: unknown[]): string => {
  return args
    .flat()
    .filter((x) => typeof x === "string")
    .join(" ")
    .trim();
};

export const shuffle = (list: [number, number][]): void => {
  let currentIndex = list.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [list[currentIndex], list[randomIndex]] = [
      list[randomIndex],
      list[currentIndex],
    ];
  }
};

export const nestedArrayContains = (
  array: [number, number][],
  item: [number, number],
): boolean => {
  array.forEach(([a, b]) => {
    if (a == item[0]) {
      if (b == item[1]) {
        return true;
      }
    }
  });
  return false;
};

export const ALGO_MAPPER = {
  [MethodEnum.BFS]: Search.bfs,
  [MethodEnum.DFS]: Search.dfs,
  [MethodEnum.ASTAR]: Search.astar,
  [MethodEnum.DFSH]: Search.dfsHeuristic,
  [MethodEnum.GBFS]: Search.gbfs,
  [MethodEnum.JPS]: Search.jps,
};

export const getAlgorithmFunction = (
  method: MethodEnum,
): FinderInputOptions => {
  const methodEnumKey = method as keyof typeof MethodEnum;
  const algoMapperKey = MethodEnum[methodEnumKey] as keyof typeof ALGO_MAPPER;
  return ALGO_MAPPER[algoMapperKey];
};

export const benchmark = (
  start: [number, number],
  end: [number, number],
  graph: Graph,
  heuristic: HeuristicEnum,
): Record<string, { nIter: number; nScan: number; pLen: number }> => {
  if (!graph) return {};
  const results: Record<
    string,
    { nIter: number; nScan: number; pLen: number }
  > = {};
  Object.entries(ALGO_MAPPER).forEach(([k, fct]) => {
    const finder = fct(start, end, graph, heuristic);
    let res = finder.next();
    let nIter = 0;
    let nScan = 0;
    let pLen = 0;
    while (!res.done) {
      const { status, data } = res.value;
      switch (status) {
        case YieldEnum.SEARCH:
          nIter++;
          break;
        case YieldEnum.SCAN:
          nScan++;
          break;
        case YieldEnum.PATH:
          if (data) {
            let interP = 0;
            // JPS prevents us from using length directly.
            for (let i = 1; i < data.length; i++) {
              const prevD: [number, number] = (data as [number, number][])[
                i - 1
              ];
              const curD: [number, number] = (data as [number, number][])[i];
              interP += Math.max(
                Math.abs(prevD[0] - curD[0]),
                Math.abs(prevD[1] - curD[1]),
              );
            }
            pLen = interP;
          }
          break;
        case YieldEnum.ERROR:
          nIter = 0;
          nScan = 0;
          pLen = 0;
          break;
      }
      res = finder.next();
    }
    results[k] = { nIter, nScan, pLen };
  });
  return results;
};
