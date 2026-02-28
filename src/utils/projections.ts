import type { BokariNode, BokariEdge, InvestmentYearData, InvestmentNodeProjection, InvestmentProjectionResult } from '../types';
import updateTree from './updateTree';

export function computeInvestmentProjection(
  nodes: BokariNode[],
  edges: BokariEdge[],
  horizonYears: number,
): InvestmentProjectionResult {
  // Find investment nodes
  const investmentNodeIds = nodes
    .filter((n) => n.data.isInvestment)
    .map((n) => n.id);

  if (investmentNodeIds.length === 0) {
    return { horizonYears, nodes: [], totals: [] };
  }

  // For each year, scale roots by their own annualGrowth and recalculate tree
  const yearlyContributions: Map<string, number[]> = new Map();
  for (const id of investmentNodeIds) {
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

    for (const id of investmentNodeIds) {
      const found = computed.find((n) => n.id === id);
      yearlyContributions.get(id)!.push(found ? found.data.value : 0);
    }
  }

  // For each investment node, compute month-by-month compounding
  const nodeProjections: InvestmentNodeProjection[] = investmentNodeIds.map((id) => {
    const sourceNode = nodes.find((n) => n.id === id)!;
    const expectedReturn = sourceNode.data.expectedReturn ?? 7;
    const monthlyRate = expectedReturn / 100 / 12;
    const contributions = yearlyContributions.get(id)!;

    const yearlyData: InvestmentYearData[] = [];
    let portfolio = 0;
    let totalContributed = 0;

    for (let year = 0; year <= horizonYears; year++) {
      const monthlyContribution = contributions[year];

      if (year === 0) {
        // Year 0 = "Now", just record the starting point
        yearlyData.push({
          year,
          monthlyContribution,
          cumulativeContributions: 0,
          portfolioValue: 0,
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
        growth: portfolio - totalContributed,
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
