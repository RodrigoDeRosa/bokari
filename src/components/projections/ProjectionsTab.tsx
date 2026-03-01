import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Slider from '@mui/material/Slider'; // still used for horizon
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [horizonYears, setHorizonYears] = useState(20);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [chartViewMode, setChartViewMode] = useState<'total' | 'perAsset'>('total');
  const [contributionDeltas, setContributionDeltas] = useState<Map<string, number>>(new Map());

  const hasInvestmentNodes = nodes.some((n) => n.data.isInvestment);

  const hasActiveDeltas = Array.from(contributionDeltas.values()).some((d) => d !== 0);

  const result = useMemo(() => {
    if (!hasInvestmentNodes || horizonYears <= 0) {
      return null;
    }
    return computeInvestmentProjection(nodes, edges, horizonYears, contributionDeltas);
  }, [nodes, edges, horizonYears, hasInvestmentNodes, contributionDeltas]);

  // Base result (without deltas) — only computed when deltas are active
  const baseResult = useMemo(() => {
    if (!hasInvestmentNodes || horizonYears <= 0 || !hasActiveDeltas) {
      return null;
    }
    return computeInvestmentProjection(nodes, edges, horizonYears);
  }, [nodes, edges, horizonYears, hasInvestmentNodes, hasActiveDeltas]);

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

  const handleDeltaChange = useCallback((nodeId: string, delta: number) => {
    setContributionDeltas((prev) => {
      const next = new Map(prev);
      if (delta === 0) {
        next.delete(nodeId);
      } else {
        next.set(nodeId, delta);
      }
      return next;
    });
  }, []);

  const handleClearAllDeltas = useCallback(() => {
    setContributionDeltas(new Map());
  }, []);

  const filteredResult = useMemo(
    () => (result ? filterResult(result, selectedNodeIds) : null),
    [result, selectedNodeIds],
  );

  const filteredBaseResult = useMemo(
    () => (baseResult ? filterResult(baseResult, selectedNodeIds) : null),
    [baseResult, selectedNodeIds],
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
            <Paper sx={{ p: isMobile ? 2 : 3 }} elevation={2}>
              {/* KPIs — full width */}
              {(() => {
                const last = filteredResult.totals[filteredResult.totals.length - 1];
                const contrib = last?.cumulativeContributions ?? 0;
                const portfolio = last?.portfolioValue ?? 0;
                const growth = last?.growth ?? 0;
                const multiplier = contrib > 0 ? portfolio / contrib : 0;

                const baseLast = filteredBaseResult?.totals[filteredBaseResult.totals.length - 1];
                const showBase = hasActiveDeltas && baseLast;

                const portfolioDelta = showBase ? portfolio - baseLast.portfolioValue : 0;
                const contribDelta = showBase ? contrib - baseLast.cumulativeContributions : 0;
                const growthDelta = showBase ? growth - baseLast.growth : 0;

                const deltaBadge = (delta: number) => {
                  const positive = delta >= 0;
                  return (
                    <Typography component="span" variant="caption" sx={{
                      ml: 0.75,
                      px: 0.75,
                      py: 0.25,
                      borderRadius: 1,
                      bgcolor: positive ? 'rgba(0,145,110,0.12)' : 'rgba(237,108,2,0.12)',
                      color: positive ? '#00916e' : '#ed6c02',
                      fontWeight: 600,
                      fontSize: '0.7rem',
                    }}>
                      {positive ? '+' : ''}{fmt(delta, currency)}
                    </Typography>
                  );
                };

                if (!showBase) {
                  /* Single row — no deltas active, identical to previous default */
                  return (
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={isMobile ? 1.5 : 3} sx={{ flexWrap: 'wrap', rowGap: 1.5 }}>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Portfolio in {horizonYears}yr
                          </Typography>
                          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: '#00916e', fontWeight: 700 }}>
                            {fmt(portfolio, currency)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Contributions
                          </Typography>
                          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 700 }}>
                            {fmt(contrib, currency)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Compound growth
                          </Typography>
                          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ color: '#ff006e', fontWeight: 700 }}>
                            {fmt(growth, currency)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Money multiplier
                          </Typography>
                          <Typography variant={isMobile ? 'h6' : 'h5'} sx={{ fontWeight: 700 }}>
                            {multiplier > 0 ? `${multiplier.toFixed(1)}x` : '–'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  );
                }

                /* Two rows — base "Current plan" + tinted "What-if scenario" */
                return (
                  <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {/* Current plan — full KPI row with muted values */}
                    <Box>
                      <Typography variant="overline" color="text.secondary" sx={{ mb: 0.5, display: 'block', lineHeight: 1.2 }}>
                        Current plan
                      </Typography>
                      <Stack direction="row" spacing={isMobile ? 1.5 : 3} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Portfolio in {horizonYears}yr
                          </Typography>
                          <Typography variant={isMobile ? 'body1' : 'h6'} color="text.secondary" sx={{ fontWeight: 600 }}>
                            {fmt(baseLast.portfolioValue, currency)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Contributions
                          </Typography>
                          <Typography variant={isMobile ? 'body1' : 'h6'} color="text.secondary" sx={{ fontWeight: 600 }}>
                            {fmt(baseLast.cumulativeContributions, currency)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Compound growth
                          </Typography>
                          <Typography variant={isMobile ? 'body1' : 'h6'} color="text.secondary" sx={{ fontWeight: 600 }}>
                            {fmt(baseLast.growth, currency)}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Money multiplier
                          </Typography>
                          <Typography variant={isMobile ? 'body1' : 'h6'} color="text.secondary" sx={{ fontWeight: 600 }}>
                            {baseLast.cumulativeContributions > 0 ? `${(baseLast.portfolioValue / baseLast.cumulativeContributions).toFixed(1)}x` : '–'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>

                    {/* What-if scenario — self-contained tinted box */}
                    <Box sx={{
                      bgcolor: 'rgba(0,145,110,0.05)',
                      borderLeft: 3,
                      borderLeftColor: '#00916e',
                      borderRadius: '0 4px 4px 0',
                      px: 1.5,
                      py: 1,
                    }}>
                      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#00916e', lineHeight: 1 }}>
                          What-if scenario
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                          Projected outcome with your contribution adjustments
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={isMobile ? 1.5 : 3} sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Portfolio in {horizonYears}yr
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography variant="body1" sx={{ color: '#00916e', fontWeight: 700 }}>
                              {fmt(portfolio, currency)}
                            </Typography>
                            {deltaBadge(portfolioDelta)}
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Contributions
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              {fmt(contrib, currency)}
                            </Typography>
                            {deltaBadge(contribDelta)}
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Compound growth
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                            <Typography variant="body1" sx={{ color: '#ff006e', fontWeight: 700 }}>
                              {fmt(growth, currency)}
                            </Typography>
                            {deltaBadge(growthDelta)}
                          </Box>
                        </Box>
                        <Box sx={{ flex: 1, minWidth: isMobile ? '45%' : 'auto' }}>
                          <Typography variant="caption" color="text.secondary">
                            Money multiplier
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 600 }}>
                            {multiplier > 0 ? `${multiplier.toFixed(1)}x` : '–'}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                );
              })()}

              {/* Two-column area: chart left, investments + sliders right */}
              <Box sx={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? 2 : 3 }}>
                <Box>
                  <ProjectionChart
                    result={filteredResult}
                    currency={currency}
                    viewMode={chartViewMode}
                    onViewModeChange={setChartViewMode}
                    nodeColorMap={nodeColorMap}
                    height={isMobile ? 260 : 350}
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
                    contributionDeltas={contributionDeltas}
                    onDeltaChange={handleDeltaChange}
                    onClearAllDeltas={handleClearAllDeltas}
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

            <Paper sx={{ p: isMobile ? 2 : 3 }} elevation={2}>
              <Typography variant="h6" gutterBottom>
                Yearly Breakdown
              </Typography>
              <ProjectionTable result={filteredResult} currency={currency} isMobile={isMobile} />
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}
