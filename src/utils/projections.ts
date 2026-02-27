import type { BokariNode, BokariEdge, ProjectionDataPoint } from '../types';
import updateTree from './updateTree';

/**
 * Compound growth via Future Value of Annuity.
 * Returns an array of length (horizonYears + 1), where index 0 = 0.
 */
export function computeCompoundGrowth(
  monthlyContribution: number,
  annualReturnPct: number,
  horizonYears: number,
): number[] {
  const r = annualReturnPct / 100 / 12;
  const result: number[] = [0];

  for (let year = 1; year <= horizonYears; year++) {
    const n = year * 12;
    if (r === 0) {
      result.push(monthlyContribution * n);
    } else {
      result.push(monthlyContribution * ((Math.pow(1 + r, n) - 1) / r));
    }
  }

  return result;
}

/**
 * Budget over time — scales root node values by annual growth, recalculates tree,
 * and extracts values for selected nodes.
 */
export function computeBudgetOverTime(
  nodes: BokariNode[],
  edges: BokariEdge[],
  selectedNodeIds: string[],
  annualGrowthPct: number,
  horizonYears: number,
): ProjectionDataPoint[] {
  const g = annualGrowthPct / 100;
  const result: ProjectionDataPoint[] = [];

  for (let year = 0; year <= horizonYears; year++) {
    const scaleFactor = Math.pow(1 + g, year);

    // Scale root nodes; leave everything else as-is for updateTree to recalculate
    const scaledNodes: BokariNode[] = nodes.map((node) => {
      if (node.type === 'rootNode') {
        return { ...node, data: { ...node.data, value: node.data.value * scaleFactor } };
      }
      return { ...node, data: { ...node.data } };
    });

    const computed = updateTree(scaledNodes, edges);

    const values: Record<string, number> = {};
    for (const id of selectedNodeIds) {
      const node = computed.find((n) => n.id === id);
      values[id] = node ? node.data.value : 0;
    }

    result.push({
      year,
      label: year === 0 ? 'Now' : `Year ${year}`,
      values,
    });
  }

  return result;
}
