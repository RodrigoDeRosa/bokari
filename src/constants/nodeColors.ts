import type { NodeType } from '../types';

export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  rootNode: '#fbbf24',
  fixedNode: '#fb923c',
  proportionalNode: '#f472b6',
  relativeNode: '#a78bfa',
  aggregatorNode: '#60a5fa',
  fixedGroupNode: '#34d399',
  assetNode: '#38bdf8',
};

export const INVESTMENT_PALETTE: string[] = [
  '#60a5fa', '#f472b6', '#fbbf24', '#a78bfa', '#34d399',
  '#fb923c', '#2dd4bf', '#38bdf8', '#fb7185', '#7dd3fc',
];
