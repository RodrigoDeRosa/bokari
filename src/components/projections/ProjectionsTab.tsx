import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider'; // still used for horizon
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useBudgetTree } from '../../context/BudgetTreeContext';
import { computeInvestmentProjection } from '../../utils/projections';
import { INVESTMENT_PALETTE } from '../../constants/nodeColors';
import type { InvestmentProjectionResult, InvestmentYearData } from '../../types';
import InvestmentSummaryCards from './InvestmentSummaryCards';
import ProjectionChart from './ProjectionChart';
import ProjectionTable from './ProjectionTable';

function fmt(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

function filterResult(
  result: InvestmentProjectionResult,
  selectedIds: Set<string>,
): InvestmentProjectionResult {
  const filtered = result.nodes.filter((n) => selectedIds.has(n.nodeId));
  if (filtered.length === 0) {
    return {
      ...result,
      nodes: filtered,
      totals: result.totals.map((t) => ({ ...t, monthlyContribution: 0, cumulativeContributions: 0, portfolioValue: 0, growth: 0 })),
    };
  }
  const totals: InvestmentYearData[] = result.totals.map((_, i) => {
    let monthlyContribution = 0, cumulativeContributions = 0, portfolioValue = 0, growth = 0;
    for (const node of filtered) {
      const yd = node.yearlyData[i];
      monthlyContribution += yd.monthlyContribution;
      cumulativeContributions += yd.cumulativeContributions;
      portfolioValue += yd.portfolioValue;
      growth += yd.growth;
    }
    return { year: result.totals[i].year, monthlyContribution, cumulativeContributions, portfolioValue, growth };
  });
  return { ...result, nodes: filtered, totals };
}

export default function ProjectionsTab() {
  const { nodes, edges, currency, handleNodeDataChange } = useBudgetTree();
  const [horizonYears, setHorizonYears] = useState(20);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [chartViewMode, setChartViewMode] = useState<'total' | 'perAsset'>('total');

  const hasInvestmentNodes = nodes.some((n) => n.data.isInvestment);

  const result = useMemo(() => {
    if (!hasInvestmentNodes || horizonYears <= 0) {
      return null;
    }
    return computeInvestmentProjection(nodes, edges, horizonYears);
  }, [nodes, edges, horizonYears, hasInvestmentNodes]);

  // Re-initialize selectedNodeIds when the set of investment nodes changes
  const investmentNodeIds = useMemo(
    () => nodes.filter((n) => n.data.isInvestment).map((n) => n.id),
    [nodes],
  );

  const prevInvestmentIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentSet = new Set(investmentNodeIds);
    const prevSet = prevInvestmentIds.current;

    setSelectedNodeIds((prev) => {
      if (prev.size === 0 && currentSet.size > 0) {
        // Initial load — select all
        prevInvestmentIds.current = currentSet;
        return currentSet;
      }
      const next = new Set<string>();
      for (const id of investmentNodeIds) {
        if (prevSet.has(id)) {
          // Existing node — keep its selection state
          if (prev.has(id)) next.add(id);
        } else {
          // New node — auto-select
          next.add(id);
        }
      }
      prevInvestmentIds.current = currentSet;
      return next;
    });
  }, [investmentNodeIds]);

  const handleToggleNode = useCallback((nodeId: string) => {
    setSelectedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  }, []);

  const handleToggleAll = useCallback(() => {
    setSelectedNodeIds((prev) => {
      const allSelected = investmentNodeIds.every((id) => prev.has(id));
      return allSelected ? new Set<string>() : new Set(investmentNodeIds);
    });
  }, [investmentNodeIds]);

  const handleReturnChange = useCallback(
    (nodeId: string, rate: number) => {
      handleNodeDataChange(nodeId, { expectedReturn: rate });
    },
    [handleNodeDataChange],
  );

  const handleGrowthChange = useCallback(
    (nodeId: string, rate: number) => {
      handleNodeDataChange(nodeId, { annualGrowth: rate });
    },
    [handleNodeDataChange],
  );

  const filteredResult = useMemo(
    () => (result ? filterResult(result, selectedNodeIds) : null),
    [result, selectedNodeIds],
  );

  const nodeColorMap = useMemo(() => {
    const map = new Map<string, string>();
    result?.nodes.forEach((node, i) => {
      map.set(node.nodeId, INVESTMENT_PALETTE[i % INVESTMENT_PALETTE.length]);
    });
    return map;
  }, [result]);

  if (nodes.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Create nodes in the Budget tab first.
        </Typography>
      </Box>
    );
  }

  if (!hasInvestmentNodes) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 500, textAlign: 'center' }}>
          Tag nodes as investments in the Budget tab by clicking the trending-up icon on any fixed, proportional, or relative node.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: 'auto', py: 2, px: 2 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {result && result.nodes.length > 0 && filteredResult && (
          <>
            <Paper sx={{ p: 3 }} elevation={2}>
              {/* KPIs — full width */}
              <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                {(() => {
                  const last = filteredResult.totals[filteredResult.totals.length - 1];
                  const contrib = last?.cumulativeContributions ?? 0;
                  const portfolio = last?.portfolioValue ?? 0;
                  const growth = last?.growth ?? 0;
                  const multiplier = contrib > 0 ? portfolio / contrib : 0;
                  return (
                    <>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Portfolio in {horizonYears}yr
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#00916e', fontWeight: 700 }}>
                          {fmt(portfolio, currency)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Contributions
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {fmt(contrib, currency)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Compound growth
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#ff006e', fontWeight: 700 }}>
                          {fmt(growth, currency)}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Money multiplier
                        </Typography>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {multiplier > 0 ? `${multiplier.toFixed(1)}x` : '–'}
                        </Typography>
                      </Box>
                    </>
                  );
                })()}
              </Stack>

              {/* Two-column area: chart left, investments + sliders right */}
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 3 }}>
                <Box>
                  <ProjectionChart
                    result={filteredResult}
                    currency={currency}
                    viewMode={chartViewMode}
                    onViewModeChange={setChartViewMode}
                    nodeColorMap={nodeColorMap}
                    height={350}
                  />
                </Box>

                <Box>
                  <InvestmentSummaryCards
                    result={result}
                    currency={currency}
                    onReturnChange={handleReturnChange}
                    selectedNodeIds={selectedNodeIds}
                    onToggleNode={handleToggleNode}
                    onToggleAll={handleToggleAll}
                    nodeColorMap={nodeColorMap}
                    nodes={nodes}
                    onGrowthChange={handleGrowthChange}
                  />

                  {/* Settings slider */}
                  <Stack spacing={1.5} sx={{ mt: 2 }}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                        <Typography variant="body2">Horizon</Typography>
                        <Typography variant="body2" fontWeight={600}>{horizonYears} years</Typography>
                      </Stack>
                      <Slider
                        size="small"
                        value={horizonYears}
                        min={1}
                        max={40}
                        step={1}
                        onChange={(_e, val) => setHorizonYears(val as number)}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(v) => `${v}yr`}
                      />
                    </Box>
                  </Stack>
                </Box>
              </Box>
            </Paper>

            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="h6" gutterBottom>
                Yearly Breakdown
              </Typography>
              <ProjectionTable result={filteredResult} currency={currency} />
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}
