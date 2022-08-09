import { DepGraph } from "dependency-graph";

export function depGraphToTaskOrder<T>(depGraph: DepGraph<T>): T[][] {
  const taskOrder: T[][] = [];
  let depIds = depGraph.overallOrder(true);
  while (depIds?.length) {
    taskOrder.push(depIds.map((i) => depGraph.getNodeData(i) as T));
    depIds.forEach((i) => depGraph.removeNode(i));
    depIds = depGraph.overallOrder(true);
  }
  return taskOrder;
}

export function depGraphToTaskOrderFlat<T>(depGraph: DepGraph<T>): T[] {
  return depGraphToTaskOrder(depGraph).flat();
}

export function depGraphToArray<T>(depGraph: DepGraph<T>): T[] {
  return depGraph.overallOrder().map((i) => depGraph.getNodeData(i) as T);
}
