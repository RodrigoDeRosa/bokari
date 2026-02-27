import { getIncomers, getOutgoers } from '@xyflow/react';
import type { BokariNode, BokariEdge } from '../types';

function getAncestors(nodeId: string, nodes: BokariNode[], edges: BokariEdge[]): Set<BokariNode> {
  const ancestors = new Set<BokariNode>();
  const visited = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentNode = nodes.find((n) => n.id === currentId);
    if (!currentNode) continue;

    const parents = getIncomers(currentNode, nodes, edges);
    for (const parent of parents) {
      if (!visited.has(parent.id)) {
        ancestors.add(parent as BokariNode);
        queue.push(parent.id);
      }
    }
  }

  return ancestors;
}

function getDescendants(nodeId: string, nodes: BokariNode[], edges: BokariEdge[]): Set<BokariNode> {
  const descendants = new Set<BokariNode>();
  const visited = new Set<string>();
  const queue = [nodeId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const currentNode = nodes.find((n) => n.id === currentId);
    if (!currentNode) continue;

    const children = getOutgoers(currentNode, nodes, edges);
    for (const child of children) {
      if (!visited.has(child.id)) {
        descendants.add(child as BokariNode);
        queue.push(child.id);
      }
    }
  }

  return descendants;
}

export interface InvestmentConflict {
  label: string;
  direction: 'upstream' | 'downstream';
}

export function findInvestmentConflicts(
  nodeId: string,
  nodes: BokariNode[],
  edges: BokariEdge[],
): InvestmentConflict[] {
  const conflicts: InvestmentConflict[] = [];

  const ancestors = getAncestors(nodeId, nodes, edges);
  for (const ancestor of ancestors) {
    if (ancestor.data.isInvestment) {
      conflicts.push({ label: ancestor.data.label, direction: 'upstream' });
    }
  }

  const descendants = getDescendants(nodeId, nodes, edges);
  for (const descendant of descendants) {
    if (descendant.data.isInvestment) {
      conflicts.push({ label: descendant.data.label, direction: 'downstream' });
    }
  }

  return conflicts;
}
