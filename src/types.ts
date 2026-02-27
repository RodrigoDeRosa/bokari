import type { Node, Edge } from '@xyflow/react';

export interface FixedGroupChild {
  id: string;
  label: string;
  value: number;
}

export interface NodeData extends Record<string, unknown> {
  label: string;
  value: number;
  proportion?: number;
  children?: FixedGroupChild[];
}

export interface RuntimeNodeData extends NodeData {
  handleNodeDataChange: (id: string, data: Record<string, unknown>) => void;
  currency: string;
}

export type BokariNode = Node<NodeData>;
export type BokariEdge = Edge;

export type NodeType =
  | 'rootNode'
  | 'fixedNode'
  | 'proportionalNode'
  | 'relativeNode'
  | 'aggregatorNode'
  | 'fixedGroupNode';

export interface ProjectionDataPoint {
  year: number;
  label: string;
  values: Record<string, number>;
}
