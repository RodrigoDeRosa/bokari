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
  incomeGrowthPct: number;
  nodes: InvestmentNodeProjection[];
  totals: InvestmentYearData[];
}
