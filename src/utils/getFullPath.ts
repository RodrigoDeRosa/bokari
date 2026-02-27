import type { BokariEdge } from '../types';

export interface PathResult {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
}

export default function getFullPath(nodeId: string, edges: BokariEdge[]): PathResult {
  const nodeIds = new Set<string>([nodeId]);
  const edgeIds = new Set<string>();

  // Build adjacency maps
  const childrenOf = new Map<string, { target: string; edgeId: string }[]>();
  const parentsOf = new Map<string, { source: string; edgeId: string }[]>();

  for (const edge of edges) {
    if (!childrenOf.has(edge.source)) childrenOf.set(edge.source, []);
    childrenOf.get(edge.source)!.push({ target: edge.target, edgeId: edge.id });

    if (!parentsOf.has(edge.target)) parentsOf.set(edge.target, []);
    parentsOf.get(edge.target)!.push({ source: edge.source, edgeId: edge.id });
  }

  // Traverse upstream (parents)
  const upQueue = [nodeId];
  while (upQueue.length > 0) {
    const current = upQueue.pop()!;
    for (const { source, edgeId } of parentsOf.get(current) ?? []) {
      edgeIds.add(edgeId);
      if (!nodeIds.has(source)) {
        nodeIds.add(source);
        upQueue.push(source);
      }
    }
  }

  // Traverse downstream (children)
  const downQueue = [nodeId];
  while (downQueue.length > 0) {
    const current = downQueue.pop()!;
    for (const { target, edgeId } of childrenOf.get(current) ?? []) {
      edgeIds.add(edgeId);
      if (!nodeIds.has(target)) {
        nodeIds.add(target);
        downQueue.push(target);
      }
    }
  }

  return { nodeIds, edgeIds };
}
