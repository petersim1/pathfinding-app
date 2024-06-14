import { GraphContext } from "@/providers/graph";
import { useContext } from "react";
import { GraphContextI } from "./types";

export const useGraph = (): GraphContextI => useContext(GraphContext);
