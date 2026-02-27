import type { NodeType } from '../types';

export const NODE_TYPE_COLORS: Record<NodeType, string> = {
  rootNode: '#ffbe0b',
  fixedNode: '#fb5607',
  proportionalNode: '#ff006e',
  relativeNode: '#8338ec',
  aggregatorNode: '#3a86ff',
  fixedGroupNode: '#00916e',
};

export const INVESTMENT_PALETTE: string[] = [
  '#3a86ff', '#ff006e', '#ffbe0b', '#8338ec', '#00916e',
  '#fb5607', '#06d6a0', '#118ab2', '#e63946', '#457b9d',
];
