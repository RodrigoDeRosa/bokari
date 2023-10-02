import { getIncomers, getOutgoers } from "reactflow";

export default function updateTree(nodes, edges, setNodes, setEdges) {
  let rootNodes = nodes.filter((node) => node.type === "rootNode");

  rootNodes.forEach((rootNode) => {
    let neighbors = [rootNode];

    while (neighbors.length > 0) {
      let currentNode = neighbors.pop();

      let children = getOutgoers(currentNode, nodes, edges);
      if (children.length === 0) {
        continue;
      }

      // Recalculate the value of each proportional node in case the parent's value changed
      children
        .filter((child) => child.type === "proportionalNode")
        .forEach((child) => {
          child.data = {
            ...child.data,
            value: (child.data.proportion / 100) * currentNode.data.value,
          };
        });

      // If a node has 1 child, then it also has a relative child
      // and we want to recalculate its value
      let usedTotal = children
        .filter((child) => child.type !== "relativeNode")
        .reduce((acc, child) => acc + child.data.value, 0);
      children
        .filter((child) => child.type === "relativeNode")
        .map(
          (child) =>
            (child.data = {
              ...child.data,
              value: currentNode.data.value - usedTotal,
            })
        );

      neighbors.push(...children);
    }
  });

  let aggregatorNodes = nodes.filter((node) => node.type === "aggregatorNode");
  aggregatorNodes.forEach((aggregatorNode) => {
    let parents = getIncomers(aggregatorNode, nodes, edges);
    let totalValue = parents.reduce(
      (acc, parent) => acc + parent.data.value,
      0
    );
    aggregatorNode.data = {
      ...aggregatorNode.data,
      value: totalValue,
    };
  });

  setNodes((nds) => nds.map((node) => node));
  setEdges((eds) => eds.map((edge) => edge));
}
