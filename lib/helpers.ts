import { FinderInputOptions } from "./types";
import { MethodEnum } from "./types/enum";
import { astar, bfs, dfs, dfsHeuristic, gbfs } from "./utils/finders";

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

const ALGO_MAPPER = {
  [MethodEnum.BFS]: bfs,
  [MethodEnum.DFS]: dfs,
  [MethodEnum.ASTAR]: astar,
  [MethodEnum.DFSH]: dfsHeuristic,
  [MethodEnum.GBFS]: gbfs,
};

export const getAlgorithmFunction = (
  method: MethodEnum,
): FinderInputOptions => {
  const methodEnumKey = method as keyof typeof MethodEnum;
  const algoMapperKey = MethodEnum[methodEnumKey] as keyof typeof ALGO_MAPPER;
  return ALGO_MAPPER[algoMapperKey];
};
