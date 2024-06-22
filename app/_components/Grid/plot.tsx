"use client";

import { useEffect, useRef, useState } from "react";
import { select } from "d3";

import { cn, getAlgorithmFunction, benchmark } from "@/lib/helpers";
import { useGraph } from "@/lib/hooks";
import { randomGrid } from "@/lib/utils/grid_generator";
import { createMainGrid, addSearchNode, addSearchPath } from "@/lib/plotter";
import Dimensions from "./dimensions";
import Benchmark from "./benchmark";

const Visual = (): JSX.Element => {
  const { graph, fields } = useGraph();
  const [grid, setGrid] = useState<{
    start: [number, number];
    end: [number, number];
  }>({ start: [0, 0], end: [0, 0] });
  const [percent, setPercent] = useState(0.5);
  const [isError, setIsError] = useState("");
  const [benchmarked, setBenchmarked] = useState<
    Record<string, { nIter: number; pLen: number }>
  >({});
  const shouldRun = useRef<boolean>(false);
  const delay = useRef<number>(100);

  const ref = useRef(null);

  useEffect(() => {
    if (!graph) return;
    // if the provider tells us to reset the grid, we will.
    // this occurs when dimensions change.
    shouldRun.current = false;
    const svg = select(ref.current);
    svg.selectAll("*").remove();
    setGrid({
      start: [Math.round(graph.current.rows / 2), 0],
      end: [Math.round(graph.current.rows / 2), graph.current.cols - 1],
    });

    graph.current.initializeGrid();
    createMainGrid(svg, graph.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields.dimension]);

  useEffect(() => {
    if (!graph) return;
    setBenchmarked(
      benchmark(grid.start, grid.end, graph.current, fields.heuristic),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, fields.diagonal, fields.heuristic, fields.dimension]);

  const clear = (): void => {
    if (!graph) return;
    setIsError("");
    shouldRun.current = false;
    graph.current.initializeGrid();
    const s: [number, number] = [Math.round(graph.current.rows / 2), 0];
    const e: [number, number] = [
      Math.round(graph.current.rows / 2),
      graph.current.cols - 1,
    ];
    setGrid({
      start: s,
      end: e,
    });

    const svg = select(ref.current);
    svg.selectAll("*").remove();
    createMainGrid(svg, graph.current);
  };

  const randomize = (): void => {
    if (!graph) return;
    setIsError("");
    shouldRun.current = false;
    const svg = select(ref.current);
    svg.selectAll("*").remove();

    graph.current.initializeGrid();
    const [s, e] = randomGrid(graph.current, percent);
    setGrid((prev) => ({ ...prev, start: s, end: e }));

    createMainGrid(svg, graph.current, s, e);
  };

  const start = async (): Promise<void> => {
    if (!graph) return;
    setIsError("");
    shouldRun.current = true;
    const svg = select(ref.current);
    svg.selectAll("g.circle-group").remove();
    svg.selectAll("g.path-group").remove();

    const fct = getAlgorithmFunction(fields.method);
    const finder = fct(grid.start, grid.end, graph.current, fields.heuristic);

    let res = finder.next();
    while (!res.done && shouldRun.current) {
      const { status, data } = res.value;
      await new Promise((resolve) => setTimeout(resolve, delay.current));
      switch (status) {
        case "search":
          if (JSON.stringify(data) !== JSON.stringify(grid.start)) {
            // it's likely that within the loop (due to the delay), that the shouldRun
            // was adjusted. We don't still want to fill the canvas, so add another check.
            if (shouldRun.current) {
              addSearchNode(svg, graph.current, data as [number, number]);
            }
          }
          break;
        case "path":
          if (shouldRun.current) {
            addSearchPath(svg, graph.current, data as [number, number][]);
          }
          break;
        case "error":
          if (shouldRun.current) {
            setIsError("no valid path!");
          }
      }
      res = finder.next();
    }
  };

  const stop = (): void => {
    shouldRun.current = false;
  };

  const clearSearch = (): void => {
    setIsError("");
    shouldRun.current = false;
    const svg = select(ref.current);
    svg.selectAll("g.circle-group").remove();
    svg.selectAll("g.path-group").remove();
  };

  const handleSpeed = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = Number(e.currentTarget.value);
    delay.current = 201 - value;
  };

  return (
    <div className="w-full text-left">
      <Dimensions />
      <div className="flex flex-col justify-start items-center w-full gap-2 text-center">
        <div className="flex flex-row gap-4 justify-center">
          <button
            onClick={clear}
            className={cn(
              "border border-white rounded-md px-2 py-1 transition-all",
              "hover:opacity-85 hover:scale-[99%]",
            )}
          >
            Blank Grid
          </button>
          <button
            onClick={randomize}
            className={cn(
              "border border-white rounded-md px-2 py-1 transition-all",
              "hover:opacity-85 hover:scale-[99%]",
            )}
          >
            Generate Random Grid
          </button>
        </div>
        <label className="block">
          <p>Grid Sparsity</p>
          <input
            type="range"
            onChange={(e): void => setPercent(Number(e.currentTarget.value))}
            min={0.1}
            max={0.75}
            step={0.01}
          />
        </label>
      </div>
      <div className="flex flex-col justify-start items-center w-full gap-2 relative">
        {isError && (
          <span className="text-sm text-red-400 absolute top-0 left-1/2 -translate-x-1/2">
            {isError}
          </span>
        )}
        <Benchmark benchmark={benchmarked} />
        <div ref={ref} className="w-[500px] h-[550px]" id="data-viz" />
        <div className="text-center">
          <div className="flex flex-row justify-center gap-4 mb-4">
            <button
              onClick={start}
              className={cn(
                "border border-white rounded-md px-2 py-1 transition-all",
                "hover:opacity-85 hover:scale-[99%]",
              )}
            >
              Start Search
            </button>
            <button
              onClick={stop}
              className={cn(
                "border border-white rounded-md px-2 py-1 transition-all",
                "hover:opacity-85 hover:scale-[99%]",
              )}
            >
              Stop Search
            </button>
            <button
              onClick={clearSearch}
              className={cn(
                "border border-white rounded-md px-2 py-1 transition-all",
                "hover:opacity-85 hover:scale-[99%]",
              )}
            >
              Clear Search
            </button>
          </div>
          <label className="block">
            <p>Speed</p>
            <input
              type="range"
              onChange={handleSpeed}
              min={1}
              max={200}
              step={1}
            />
          </label>
        </div>
      </div>
    </div>
  );
};

export default Visual;
