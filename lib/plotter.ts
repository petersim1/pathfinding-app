import * as d3 from "d3";
import Graph from "./utils/Graph";

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
  graph: Graph,
  start?: [number, number],
  target?: [number, number],
): void => {
  const CELL_SIZE = Math.min(
    plottingProps.height / graph.rows,
    plottingProps.width / graph.cols,
  );

  const OFFSET_X = (Math.max(0, graph.rows - graph.cols) * CELL_SIZE) / 2;
  const OFFSET_Y = (Math.max(0, graph.cols - graph.rows) * CELL_SIZE) / 2;

  const START_USE = start ?? [Math.round(graph.rows / 2), 0];

  const TARGET_USE = target ?? [Math.round(graph.rows / 2), graph.cols - 1];

  const data = prepareGrid(graph);

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
    .attr("fill", (d) => (d.d == 0 ? "black" : "white"));

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

  const points = svg.append("g");

  points
    .append("circle")
    .attr("cx", START_USE[1] * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X)
    .attr(
      "cy",
      START_USE[0] * CELL_SIZE +
        CELL_SIZE / 2 +
        plottingProps.legend +
        OFFSET_Y,
    )
    .attr("r", CELL_SIZE / 2)
    .attr("fill", "green");

  points
    .append("circle")
    .attr("cx", TARGET_USE[1] * CELL_SIZE + CELL_SIZE / 2 + OFFSET_X)
    .attr(
      "cy",
      TARGET_USE[0] * CELL_SIZE +
        CELL_SIZE / 2 +
        plottingProps.legend +
        OFFSET_Y,
    )
    .attr("r", CELL_SIZE / 2)
    .attr("fill", "red");
};

export const addSearchNode = (
  holder: d3.Selection<null, unknown, null, undefined>,
  graph: Graph,
  position: [number, number],
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
    .attr("fill", "blue")
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
