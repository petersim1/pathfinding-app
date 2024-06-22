/* eslint-disable @typescript-eslint/no-explicit-any */
import Graph from "../utils/Graph";

import { MethodEnum, HeuristicEnum, YieldEnum } from "./enum";

export type GraphFieldsI = {
  method: MethodEnum;
  heuristic: HeuristicEnum;
  diagonal: boolean;
  dimension: [number, number];
};

export type GraphContextI = {
  graph: React.MutableRefObject<Graph> | null;
  fields: GraphFieldsI;
  resetViz: boolean;
  fieldsSetter: (data: { [key: string]: any }) => void;
  reset: () => void;
  update: (dimension: [number, number], diagonal: boolean) => void;
  setResetViz: React.Dispatch<React.SetStateAction<boolean>>;
};

export type GeneratorFinderI = Generator<{
  status: YieldEnum;
  data: [number, number] | [number, number][] | null;
}>;

type FinderSimpleInputI = (
  start: [number, number],
  target: [number, number],
  graph: Graph,
) => GeneratorFinderI;

type FinderComplexInputI = (
  start: [number, number],
  target: [number, number],
  graph: Graph,
  heuristic: HeuristicEnum,
) => GeneratorFinderI;

export type FinderInputOptions = FinderSimpleInputI | FinderComplexInputI;
