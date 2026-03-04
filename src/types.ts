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
  isInvestment?: boolean;
  expectedReturn?: number;  // annual %, default 7
  annualGrowth?: number;    // annual %, default 0 (root nodes only)
  initialValue?: number;    // asset nodes only — starting portfolio value
}

export interface InvestmentConflict {
  label: string;
  direction: 'upstream' | 'downstream';
}

export interface RuntimeNodeData extends NodeData {
  handleNodeDataChange: (id: string, data: Record<string, unknown>) => void;
  getInvestmentConflicts: (nodeId: string) => InvestmentConflict[];
  setInvestmentError: (message: string | null) => void;
  currency: string;
  injectionTotal?: number;  // asset nodes only — sum of connected budget node values
}

export interface BokariEdgeData extends Record<string, unknown> {
  isInjection?: boolean;
}

export type BokariNode = Node<NodeData>;
export type BokariEdge = Edge<BokariEdgeData>;

export type NodeType =
  | 'rootNode'
  | 'fixedNode'
  | 'proportionalNode'
  | 'relativeNode'
  | 'aggregatorNode'
  | 'fixedGroupNode'
  | 'assetNode';

export interface InvestmentYearData {
  year: number;
  monthlyContribution: number;
  cumulativeContributions: number;
  portfolioValue: number;
  growth: number; // portfolioValue - cumulativeContributions
}

export interface InvestmentNodeProjection {
  nodeId: string;
  label: string;
  expectedReturn: number;
  yearlyData: InvestmentYearData[];
}

export interface InvestmentProjectionResult {
  horizonYears: number;
  nodes: InvestmentNodeProjection[];
  totals: InvestmentYearData[];
}

