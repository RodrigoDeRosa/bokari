import { getIncomers, getOutgoers } from '@xyflow/react';
import type { BokariNode, BokariEdge } from '../types';

export default function updateTree(
  nodes: BokariNode[],
  edges: BokariEdge[],
): BokariNode[] {
  // Work on a deep copy so we don't mutate the originals
  const updated = nodes.map((node) => ({ ...node, data: { ...node.data } }));

  // Build in-degree map (count of incoming edges per node)
  const inDegree = new Map<string, number>();
  for (const node of updated) {
    inDegree.set(node.id, 0);
  }
  for (const edge of edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  // Seed BFS queue with roots (in-degree 0)
  const queue: BokariNode[] = [];
  for (const node of updated) {
    if (inDegree.get(node.id) === 0) {
      queue.push(node);
    }
  }

  // BFS: process each node only after all its parents are done
  while (queue.length > 0) {
    const currentNode = queue.shift()!;

    // Aggregator: value = sum of parent values
    if (currentNode.type === 'aggregatorNode') {
      const parents = getIncomers(currentNode, updated, edges) as BokariNode[];
      currentNode.data = {
        ...currentNode.data,
        value: parents.reduce((acc, p) => acc + p.data.value, 0),
      };
    }

    const children = getOutgoers(currentNode, updated, edges) as BokariNode[];
    if (children.length === 0) continue;

    // Update proportional children
    children
      .filter((child) => child.type === 'proportionalNode')
      .forEach((child) => {
        child.data = {
          ...child.data,
          value: ((child.data.proportion ?? 0) / 100) * currentNode.data.value,
        };
      });

    // Compute used total from non-relative children (for relative node calculation)
    const usedTotal = children
      .filter((child) => child.type !== 'relativeNode')
      .reduce((acc, child) => acc + child.data.value, 0);

    // Update relative children
    children
      .filter((child) => child.type === 'relativeNode')
      .forEach((child) => {
        child.data = {
          ...child.data,
          value: currentNode.data.value - usedTotal,
        };
      });

    // Decrement in-degree for children; enqueue when all parents processed
    for (const child of children) {
      const deg = (inDegree.get(child.id) ?? 1) - 1;
      inDegree.set(child.id, deg);
      if (deg === 0) {
        queue.push(child);
      }
    }
  }

  return updated;
}
