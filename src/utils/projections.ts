import type { BokariNode, BokariEdge, InvestmentYearData, InvestmentNodeProjection, InvestmentProjectionResult } from '../types';
import updateTree from './updateTree';

export function computeInvestmentProjection(
  nodes: BokariNode[],
  edges: BokariEdge[],
  horizonYears: number,
  contributionDeltas?: Map<string, number>,
): InvestmentProjectionResult {
  // Find budget-based investment nodes
  const budgetInvestmentIds = nodes
    .filter((n) => n.data.isInvestment)
    .map((n) => n.id);

  // Find asset nodes
  const assetNodes = nodes.filter((n) => n.type === 'assetNode');
  const assetNodeIds = assetNodes.map((n) => n.id);

  const allInvestmentIds = [...budgetInvestmentIds, ...assetNodeIds];

  if (allInvestmentIds.length === 0) {
    return { horizonYears, nodes: [], totals: [] };
  }

  // Build injection source map for asset nodes: assetNodeId → [sourceNodeIds]
  const injectionSources = new Map<string, string[]>();
  for (const assetId of assetNodeIds) {
    const sourceIds = edges
      .filter((e) => e.target === assetId && e.data?.isInjection)
      .map((e) => e.source);
    injectionSources.set(assetId, sourceIds);
  }

  // For each year, scale roots by their own annualGrowth and recalculate tree
  const yearlyContributions: Map<string, number[]> = new Map();
  for (const id of allInvestmentIds) {
    yearlyContributions.set(id, []);
  }

  for (let year = 0; year <= horizonYears; year++) {
    const scaledNodes: BokariNode[] = nodes.map((node) => {
      if (node.type === 'rootNode') {
        const g = (node.data.annualGrowth ?? 0) / 100;
        const scaleFactor = Math.pow(1 + g, year);
        return { ...node, data: { ...node.data, value: node.data.value * scaleFactor } };
      }
      return { ...node, data: { ...node.data } };
    });

    const computed = updateTree(scaledNodes, edges);

    // Budget investment nodes: contribution = their own value
    for (const id of budgetInvestmentIds) {
      const found = computed.find((n) => n.id === id);
      yearlyContributions.get(id)!.push(found ? found.data.value : 0);
    }

    // Asset nodes: contribution = sum of injection source values
    for (const assetId of assetNodeIds) {
      const sourceIds = injectionSources.get(assetId) ?? [];
      const total = sourceIds.reduce((sum, srcId) => {
        const srcNode = computed.find((n) => n.id === srcId);
        return sum + (srcNode?.data.value ?? 0);
      }, 0);
      yearlyContributions.get(assetId)!.push(total);
    }
  }

  // Apply contribution deltas — scale delta proportionally with income growth
  if (contributionDeltas && contributionDeltas.size > 0) {
    for (const id of allInvestmentIds) {
      const delta = contributionDeltas.get(id) ?? 0;
      if (delta === 0) continue;
      const contributions = yearlyContributions.get(id)!;
      const baseValue = contributions[0];
      for (let i = 0; i < contributions.length; i++) {
        const scaleFactor = baseValue > 0 ? contributions[i] / baseValue : 1;
        contributions[i] = Math.max(0, contributions[i] + delta * scaleFactor);
      }
    }
  }

  // For each investment node, compute month-by-month compounding
  const nodeProjections: InvestmentNodeProjection[] = allInvestmentIds.map((id) => {
    const sourceNode = nodes.find((n) => n.id === id)!;
    const isAsset = sourceNode.type === 'assetNode';
    const expectedReturn = sourceNode.data.expectedReturn ?? 7;
    const monthlyRate = expectedReturn / 100 / 12;
    const contributions = yearlyContributions.get(id)!;
    const initialValue = isAsset ? (sourceNode.data.initialValue ?? 0) : 0;

    const yearlyData: InvestmentYearData[] = [];
    let portfolio = initialValue;
    let totalContributed = 0;

    for (let year = 0; year <= horizonYears; year++) {
      const monthlyContribution = contributions[year];

      if (year === 0) {
        // Year 0 = "Now", record the starting point
        yearlyData.push({
          year,
          monthlyContribution,
          cumulativeContributions: 0,
          portfolioValue: initialValue,
          growth: 0,
        });
        continue;
      }

      // Simulate 12 months for this year
      for (let month = 0; month < 12; month++) {
        portfolio = (portfolio + monthlyContribution) * (1 + monthlyRate);
        totalContributed += monthlyContribution;
      }

      yearlyData.push({
        year,
        monthlyContribution,
        cumulativeContributions: totalContributed,
        portfolioValue: portfolio,
        growth: portfolio - totalContributed - initialValue,
      });
    }

    return {
      nodeId: id,
      label: sourceNode.data.label,
      expectedReturn,
      yearlyData,
    };
  });

  // Compute totals across all nodes
  const totals: InvestmentYearData[] = [];
  for (let year = 0; year <= horizonYears; year++) {
    const total: InvestmentYearData = {
      year,
      monthlyContribution: 0,
      cumulativeContributions: 0,
      portfolioValue: 0,
      growth: 0,
    };

    for (const proj of nodeProjections) {
      const yd = proj.yearlyData[year];
      total.monthlyContribution += yd.monthlyContribution;
      total.cumulativeContributions += yd.cumulativeContributions;
      total.portfolioValue += yd.portfolioValue;
      total.growth += yd.growth;
    }

    totals.push(total);
  }

  return {
    horizonYears,
    nodes: nodeProjections,
    totals,
  };
}
