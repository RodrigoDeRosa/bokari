import dagre from '@dagrejs/dagre';
import type { BokariNode, BokariEdge } from '../types';

const DEFAULT_WIDTH = 130;
const FIXED_GROUP_WIDTH = 250;
const DEFAULT_HEIGHT = 50;

export default function autoLayout(nodes: BokariNode[], edges: BokariEdge[]): BokariNode[] {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 40, ranksep: 80 });

  for (const node of nodes) {
    const width = node.type === 'fixedGroupNode' ? FIXED_GROUP_WIDTH : DEFAULT_WIDTH;
    const height = node.measured?.height ?? DEFAULT_HEIGHT;
    g.setNode(node.id, { width, height });
  }

  for (const edge of edges) {
    g.setEdge(edge.source, edge.target);
  }

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    const width = node.type === 'fixedGroupNode' ? FIXED_GROUP_WIDTH : DEFAULT_WIDTH;
    const height = node.measured?.height ?? DEFAULT_HEIGHT;
    return {
      ...node,
      position: {
        x: pos.x - width / 2,
        y: pos.y - height / 2,
      },
    };
  });
}
