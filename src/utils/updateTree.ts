import { getIncomers, getOutgoers } from '@xyflow/react';
import type { BokariNode, BokariEdge } from '../types';

export default function updateTree(
  nodes: BokariNode[],
  edges: BokariEdge[],
): BokariNode[] {
  // Work on a deep copy so we don't mutate the originals
  const updated = nodes.map((node) => ({ ...node, data: { ...node.data } }));

  const rootNodes = updated.filter((node) => node.type === 'rootNode');

  rootNodes.forEach((rootNode) => {
    const neighbors: BokariNode[] = [rootNode];

    while (neighbors.length > 0) {
      const currentNode = neighbors.pop()!;
      const children = getOutgoers(currentNode, updated, edges) as BokariNode[];

      if (children.length === 0) continue;

      children
        .filter((child) => child.type === 'proportionalNode')
        .forEach((child) => {
          child.data = {
            ...child.data,
            value: ((child.data.proportion ?? 0) / 100) * currentNode.data.value,
          };
        });

      const usedTotal = children
        .filter((child) => child.type !== 'relativeNode')
        .reduce((acc, child) => acc + child.data.value, 0);

      children
        .filter((child) => child.type === 'relativeNode')
        .forEach((child) => {
          child.data = {
            ...child.data,
            value: currentNode.data.value - usedTotal,
          };
        });

      neighbors.push(...children);
    }
  });

  const aggregatorNodes = updated.filter((node) => node.type === 'aggregatorNode');
  aggregatorNodes.forEach((aggregatorNode) => {
    const parents = getIncomers(aggregatorNode, updated, edges) as BokariNode[];
    const totalValue = parents.reduce((acc, parent) => acc + parent.data.value, 0);
    aggregatorNode.data = {
      ...aggregatorNode.data,
      value: totalValue,
    };
  });

  return updated;
}
