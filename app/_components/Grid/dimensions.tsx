"use client";

import { cn } from "@/lib/helpers";
import { useGraph } from "@/lib/hooks";
import Graph from "@/lib/utils/Graph";
// import Graph from "@/lib/utils/Graph";
import { useState } from "react";

const MAX_DIM = 50;
const MIN_DIM = 4;
const MAX_RATIO = 2;

const Dimensions = ({
  setShouldReset,
}: {
  setShouldReset: React.Dispatch<React.SetStateAction<boolean>>;
}): JSX.Element => {
  const { graph, fields, fieldsSetter } = useGraph();
  const [isError, setIsError] = useState("");
  const [dimensions, setDimensions] = useState([...fields.dimension]);

  const isValidDimension = (rows: number, cols: number): boolean => {
    if (rows < MIN_DIM || cols < MIN_DIM) {
      setIsError(`both dimensions must be >= ${MIN_DIM}`);
      return false;
    }
    if (rows > MAX_DIM || cols > MAX_DIM) {
      setIsError(`both dimensions must be <= ${MAX_DIM}`);
      return false;
    }
    if (rows / cols > MAX_RATIO) {
      setIsError(`exceeds a dimension ratio of ${MAX_RATIO}`);
      return false;
    } else if (cols / rows > MAX_RATIO) {
      setIsError(`exceeds a dimension ratio of ${MAX_RATIO}`);
      return false;
    } else {
      return true;
    }
  };

  const handleChange = (rows: number, cols: number): void => {
    if (!graph) return;
    setDimensions([rows, cols]);
    if (isValidDimension(rows, cols)) {
      setIsError("");
      fieldsSetter({
        dimension: [rows, cols],
      });
      // pull dimensions from state, not fields, as fields won't be updated
      // yet when this is called.
      graph.current = new Graph(rows, cols, graph.current.allowDiagonal);
      setShouldReset(true);
    }
  };

  return (
    <div className="flex flex-row items-center justify-center relative mb-4">
      <label className="block">
        <input
          type="number"
          className={cn(
            "appearance-none w-10 bg-transparent text-white outline-none border rounded-md text-right",
            isError && "border-red-400",
            !isError && "border-transparent",
          )}
          value={dimensions[0].toString()}
          max={MAX_DIM}
          min={0}
          step={1}
          onChange={(e): void =>
            handleChange(Number(e.currentTarget.value), dimensions[1])
          }
        />
      </label>
      <span className="mx-2">x</span>
      <label className="block">
        <input
          type="number"
          className={cn(
            "appearance-none w-10 bg-transparent text-white outline-none border rounded-md",
            isError && "border-red-400",
            !isError && "border-transparent",
          )}
          value={dimensions[1].toString()}
          max={MAX_DIM}
          min={0}
          step={1}
          onChange={(e): void =>
            handleChange(dimensions[0], Number(e.currentTarget.value))
          }
        />
      </label>
      <span className="text-xs absolute top-0 -translate-y-full">
        (edit me!)
      </span>
      {isError && (
        <span className="text-xs text-red-400 absolute bottom-0 translate-y-full">
          {isError}
        </span>
      )}
    </div>
  );
};

export default Dimensions;
