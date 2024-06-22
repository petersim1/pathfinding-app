"use client";

import { useState, useRef, createContext } from "react";
import Graph from "@/lib/utils/Graph";

import { GraphContextI, GraphFieldsI } from "@/lib/types";
import { MethodEnum, HeuristicEnum } from "@/lib/types/enum";
import { DEFAULT_DIMENSION } from "@/lib/constants";

const INITIAL_STATE: GraphFieldsI = {
  method: MethodEnum.DFS,
  heuristic: HeuristicEnum.Manhattan,
  diagonal: false,
  dimension: DEFAULT_DIMENSION,
};

export const GraphContext = createContext<GraphContextI>({
  graph: null,
  fields: { ...INITIAL_STATE },
  resetViz: false,
  fieldsSetter: () => {},
  reset: () => {},
  update: () => {},
  setResetViz: () => {},
});

const GraphProvider = ({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element => {
  const graph = useRef(new Graph(DEFAULT_DIMENSION[0], DEFAULT_DIMENSION[1]));
  const [fields, setFields] = useState({ ...INITIAL_STATE });
  const [resetViz, setResetViz] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fieldsSetter = (data: { [key: string]: any }): void => {
    setFields((prev) => ({ ...prev, ...data }));
  };

  const update = (dimension: [number, number], diagonal: boolean): void => {
    const requireReset =
      dimension[0] != graph.current.rows || dimension[1] != graph.current.cols;
    if (requireReset) {
      graph.current = new Graph(dimension[0], dimension[1], diagonal);
    } else {
      graph.current = Graph.fromGrid(graph.current.grid, diagonal);
    }

    setResetViz(requireReset);
    fieldsSetter({
      diagonal: diagonal,
      dimension: dimension,
    });
  };

  const reset = (): void => {
    fieldsSetter({ ...INITIAL_STATE });
    graph.current = new Graph(
      ...INITIAL_STATE.dimension,
      INITIAL_STATE.diagonal,
    );
  };

  const modalState: GraphContextI = {
    graph,
    fields,
    resetViz,
    fieldsSetter,
    reset,
    update,
    setResetViz,
  };

  return (
    <GraphContext.Provider value={modalState}>{children}</GraphContext.Provider>
  );
};

export default GraphProvider;
