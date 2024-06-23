import * as d3 from "d3";
import Graph from "./utils/Graph";
import { YieldEnum } from "./types/enum";
import { MutableRefObject } from "react";

const plottingProps = {
  width: 1000,
  height: 1000,
  legend: 100,
};

type DataI = {
  r: number;
  c: number;
  d: number;
};

const prepareGrid = (graph: Graph): DataI[] => {
  const data: DataI[] = [];
  graph.grid.forEach((row: number[], r_i) => {
    row.forEach((item: number, c_i) => {
      data.push({
        r: r_i,
        c: c_i,
        d: item,
      });
    });
  });
  return data;
};

export const createMainGrid = (
  holder: d3.Selection<null, unknown, null, undefined>,
  graph: MutableRefObject<Graph>,
  start: [number, number],
  target: [number, number],
  setPositions: React.Dispatch<
    React.SetStateAction<{ start: [number, number]; end: [number, number] }>
  >,
): void => {
  const CELL_SIZE = Math.min(
    plottingProps.height / graph.current.rows,
    plottingProps.width / graph.current.cols,
  );

  const OFFSET_X =
    (Math.max(0, graph.current.rows - graph.current.cols) * CELL_SIZE) / 2;
  const OFFSET_Y =
    (Math.max(0, graph.current.cols - graph.current.rows) * CELL_SIZE) / 2;

  const START_USE = start;

  const TARGET_USE = target;

  const data = prepareGrid(graph.current);

  const svg = holder
    .append("svg")
    .attr("viewBox", [
      0,
      0,
      plottingProps.width,
      plottingProps.height + plottingProps.legend,
    ])
    .style("max-height", "100%")
    .style("max-width", "100%");

  let mouseOver = false;
  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("x", (d) => d.c * CELL_SIZE + OFFSET_X)
    .attr("y", (d) => d.r * CELL_SIZE + plottingProps.legend + OFFSET_Y)
    .attr("width", CELL_SIZE)
    .attr("height", CELL_SIZE)
    .attr("class", "cell")
    .attr("stroke", "gray")
    .attr("stroke-width", "1px")
    .attr("stroke-opacity", 0.25)
    .attr("fill", (d) => (d.d == 0 ? "black" : "white"))
    .on("mousedown", function (event, d) {
      // Toggle the fill color on mousedown
      mouseOver = true;
      d.d = Number(!d.d);
      d3.select(this).attr("fill", d.d == 0 ? "black" : "white");
    })
    .on("mouseup", function () {
      mouseOver = false;
      const newGrid = Array(graph.current.rows)
        .fill(0)
        .map(() => Array(graph.current.cols).fill(0));
      // data is manipulated in the mousedown/over listeners. Can act on it directly.
      data.forEach(({ r, c, d }) => {
        newGrid[r][c] = d;
      });
      graph.current = Graph.fromGrid(newGrid, graph.current.allowDiagonal);

      // trigger some faux re-renders (graph is a ref, doesn't trigger re-renders).
      setPositions((prev) => ({
        ...prev,
        start: [0, 0],
      }));
      setPositions((prev) => ({
        ...prev,
        start,
      }));
    })
    .on("mouseover", function (event, d) {
      if (mouseOver) {
        d.d = Number(!d.d);
        d3.select(this).attr("fill", d.d == 0 ? "black" : "white");
      }
    });

  const legend = svg.append("g");
  const LEGEND_R = plottingProps.legend / 6;

  legend
    .append("circle")
    .attr("cx", plottingProps.width - LEGEND_R - OFFSET_X)
    .attr("cy", plottingProps.legend / 4 + OFFSET_Y)
    .attr("r", LEGEND_R)
    .attr("fill", "green");

  legend
    .append("text")
    .attr("x", plottingProps.width - (2 * LEGEND_R + 6) - OFFSET_X)
    .attr("y", plottingProps.legend / 4 + OFFSET_Y)
    .attr("text-anchor", "end")
    .attr("stroke", "white")
    .attr("fill", "white")
    .attr("dy", "5px")
    .attr("dy", plottingProps.legend / 16)
    .style("font-size", plottingProps.legend / 4)
    .text("start = ");

  legend
    .append("circle")
    .attr("cx", plottingProps.width - LEGEND_R - OFFSET_X)
    .attr("cy", (3 * plottingProps.legend) / 4 + OFFSET_Y)
    .attr("r", LEGEND_R)
    .attr("fill", "red");

  legend
    .append("text")
    .attr("x", plottingProps.width - (2 * LEGEND_R + 6) - OFFSET_X)
    .attr("y", (3 * plottingProps.legend) / 4 + OFFSET_Y)
    .attr("text-anchor", "end")
    .attr("stroke", "white")
    .attr("fill", "white")
    .attr("alignment-base", "middle")
    .attr("dy", plottingProps.legend / 16)
    .style("font-size", plottingProps.legend / 4)
    .text("end =");

  legend
    .append("circle")
    .attr("cx", plottingProps.width - LEGEND_R - OFFSET_X - 150)
    .attr("cy", plottingProps.legend / 4 + OFFSET_Y)
    .attr("r", LEGEND_R)
    .attr("fill", "blue");

  legend
    .append("text")
    .attr("x", plottingProps.width - (2 * LEGEND_R + 6) - OFFSET_X - 150)
    .attr("y", plottingProps.legend / 4 + OFFSET_Y)
    .attr("text-anchor", "end")
    .attr("stroke", "white")
    .attr("fill", "white")
    .attr("dy", "5px")
    .attr("dy", plottingProps.legend / 16)
    .style("font-size", plottingProps.legend / 4)
    .text("search = ");

  legend
    .append("circle")
    .attr("cx", plottingProps.width - LEGEND_R - OFFSET_X - 150)
    .attr("cy", (3 * plottingProps.legend) / 4 + OFFSET_Y)
    .attr("r", LEGEND_R)
    .attr("fill", "gray");

  legend
    .append("text")
    .attr("x", plottingProps.width - (2 * LEGEND_R + 6) - OFFSET_X - 150)
    .attr("y", (3 * plottingProps.legend) / 4 + OFFSET_Y)
    .attr("text-anchor", "end")
    .attr("stroke", "white")
    .attr("fill", "white")
    .attr("alignment-base", "middle")
    .attr("dy", plottingProps.legend / 16)
    .style("font-size", plottingProps.legend / 4)
    .text("scan =");

  const points = svg.append("g");

  const MAX_X = (graph.current.cols - 1) * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X;
  const MAX_Y =
    (graph.current.rows - 1) * CELL_SIZE +
    CELL_SIZE / 2 +
    plottingProps.legend +
    OFFSET_Y;
  const MIN_X = CELL_SIZE / 2 + OFFSET_X;
  const MIN_Y = CELL_SIZE / 2 + plottingProps.legend + OFFSET_Y;

  const drag = d3
    .drag<SVGCircleElement, unknown, unknown>()
    .on("start", function () {
      d3.select(this).raise().attr("stroke", "black").style("opacity", 0.5);
    })
    .on("drag", function (event) {
      const newX = Math.max(MIN_X, Math.min(MAX_X, event.x));
      const newY = Math.max(MIN_Y, Math.min(MAX_Y, event.y));
      d3.select(this).attr("cx", newX).attr("cy", newY);
    })
    .on("end", function (event) {
      const newX = Math.max(
        MIN_X,
        Math.min(
          MAX_X,
          Math.round(event.x / CELL_SIZE - 0.5) * CELL_SIZE + CELL_SIZE / 2,
        ),
      );
      const newY = Math.max(
        MIN_Y,
        Math.min(
          MAX_Y,
          Math.round(event.y / CELL_SIZE - 0.5) * CELL_SIZE + CELL_SIZE / 2,
        ),
      );
      const id = d3.select(this).attr("id");
      if (id == "start") {
        setPositions((prev) => ({
          ...prev,
          start: [(newY - MIN_Y) / CELL_SIZE, (newX - MIN_X) / CELL_SIZE],
        }));
      } else {
        setPositions((prev) => ({
          ...prev,
          end: [(newY - MIN_Y) / CELL_SIZE, (newX - MIN_X) / CELL_SIZE],
        }));
      }

      d3.select(this)
        .attr("stroke", null)
        .attr("cx", newX)
        .attr("cy", newY)
        .style("opacity", 1);
    });

  points
    .append("circle")
    .attr("id", "start")
    .attr("cx", START_USE[1] * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X)
    .attr(
      "cy",
      START_USE[0] * CELL_SIZE +
        CELL_SIZE / 2 +
        plottingProps.legend +
        OFFSET_Y,
    )
    .attr("r", CELL_SIZE / 2)
    .attr("fill", "green")
    .style("cursor", "grab")
    .call(drag);

  points
    .append("circle")
    .attr("id", "target")
    .attr("cx", TARGET_USE[1] * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X)
    .attr(
      "cy",
      TARGET_USE[0] * CELL_SIZE +
        CELL_SIZE / 2 +
        plottingProps.legend +
        OFFSET_Y,
    )
    .attr("r", CELL_SIZE / 2)
    .attr("fill", "red")
    .style("cursor", "grab")
    .call(drag);
};

export const addSearchNode = (
  holder: d3.Selection<null, unknown, null, undefined>,
  graph: Graph,
  position: [number, number],
  searchType: YieldEnum.SEARCH | YieldEnum.SCAN,
): void => {
  const CELL_SIZE = Math.min(
    plottingProps.height / graph.rows,
    plottingProps.width / graph.cols,
  );

  const OFFSET_X = (Math.max(0, graph.rows - graph.cols) * CELL_SIZE) / 2;
  const OFFSET_Y = (Math.max(0, graph.cols - graph.rows) * CELL_SIZE) / 2;

  const group = holder
    .select("svg")
    .selectAll("g.circle-group")
    .data([null])
    .join("g")
    .attr("class", "circle-group");

  group
    .append("circle")
    .attr("cx", position[1] * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X)
    .attr(
      "cy",
      position[0] * CELL_SIZE + CELL_SIZE / 2 + plottingProps.legend + OFFSET_Y,
    )
    .attr("r", CELL_SIZE / 2)
    .attr("fill", searchType == YieldEnum.SEARCH ? "blue" : "gray")
    .style("opacity", 0)
    .transition()
    .duration(100)
    .style("opacity", 0.2);
};

export const addSearchPath = (
  holder: d3.Selection<null, unknown, null, undefined>,
  graph: Graph,
  path: [number, number][],
): void => {
  const CELL_SIZE = Math.min(
    plottingProps.height / graph.rows,
    plottingProps.width / graph.cols,
  );

  const OFFSET_X = (Math.max(0, graph.rows - graph.cols) * CELL_SIZE) / 2;
  const OFFSET_Y = (Math.max(0, graph.cols - graph.rows) * CELL_SIZE) / 2;

  const svg = holder.select("svg");
  const lineHolder = svg.append("g").attr("class", "path-group");
  const line = d3
    .line<[number, number]>()
    .x((d) => d[1] * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X)
    .y(
      (d) => d[0] * CELL_SIZE + CELL_SIZE / 2 + plottingProps.legend + OFFSET_Y,
    );

  lineHolder
    .append("path")
    .attr("d", line(path))
    .attr("stroke", "blue")
    .attr("stroke-width", "4px")
    .style("fill", "none");
};
