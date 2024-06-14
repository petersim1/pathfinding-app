"use client";

import { cn } from "@/lib/helpers";
import { useGraph } from "@/lib/hooks";
import { MethodEnum, HeuristicEnum } from "@/lib/types/enum";
import Graph from "@/lib/utils/Graph";

const Panel = (): JSX.Element => {
  const { graph, fields, fieldsSetter } = useGraph();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (data: { [key: string]: any }): void => {
    // The only state that requires a hard reset is the dimension,
    // which we intentionally exclude here. Changing diagonal is a soft
    // reset, where we can reinitialize from existing graph.
    if (!graph) return;
    fieldsSetter({ ...data });
    if ("diagonal" in data) {
      graph.current = Graph.fromGrid(graph.current.grid, data.diagonal);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-2 w-full h-full text-sm",
        "rounded-md border border-gray-400/40 shadow shadow-gray-400/40 p-2",
      )}
    >
      <p className="text-base mb-2">Update Search Criteria</p>
      <div className="border-t border-t-white pt-2">
        <p>Search Method:</p>
        {Object.keys(MethodEnum).map((k) => (
          <div key={k}>
            <label className="whitespace-nowrap">
              <input
                type="checkbox"
                checked={k == fields.method}
                className="mr-1"
                onChange={() => handleChange({ method: k })}
              />
              {MethodEnum[k as keyof typeof MethodEnum]}
            </label>
          </div>
        ))}
      </div>
      <div className="border-t border-t-white pt-2">
        <p>Heuristic:</p>
        {Object.keys(HeuristicEnum).map((k) => (
          <div key={k}>
            <label className="whitespace-nowrap">
              <input
                type="checkbox"
                checked={k == fields.heuristic}
                className="mr-1"
                disabled={[MethodEnum.BFS, MethodEnum.DFS].includes(
                  fields.method,
                )}
                onChange={() => handleChange({ heuristic: k })}
              />
              {HeuristicEnum[k as keyof typeof HeuristicEnum]}
            </label>
          </div>
        ))}
      </div>
      <div className="border-t border-t-white pt-2">
        <p>Allow Diagonal Movement?</p>
        <label>
          <input
            type="checkbox"
            checked={fields.diagonal}
            className="mr-1"
            onChange={() => handleChange({ diagonal: !fields.diagonal })}
          />
          Yes
        </label>
      </div>
    </div>
  );
};

export default Panel;
