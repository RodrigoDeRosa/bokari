import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { useTranslation } from 'react-i18next';
import { useBudgetTree } from '../../context/BudgetTreeContext';
import { computeInvestmentProjection } from '../../utils/projections';
import { INVESTMENT_PALETTE } from '../../constants/nodeColors';
import type { InvestmentProjectionResult, InvestmentYearData } from '../../types';
import NarrativeSummary from './NarrativeSummary';
import ControlsBar from './ControlsBar';
import ProjectionChart from './ProjectionChart';
import InvestmentSettingsCards from './InvestmentSettingsCards';
import ScenarioExplorer from './ScenarioExplorer';
import ProjectionTable from './ProjectionTable';

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
  const { t } = useTranslation('projections');
  const [horizonYears, setHorizonYears] = useState(20);
  const [selectedNodeIds, setSelectedNodeIds] = useState<Set<string>>(new Set());
  const [chartViewMode, setChartViewMode] = useState<'total' | 'perAsset'>('total');
  const [contributionDeltas, setContributionDeltas] = useState<Map<string, number>>(new Map());
  const [tableExpanded, setTableExpanded] = useState(false);

  const hasInvestmentNodes = nodes.some((n) => n.data.isInvestment || n.type === 'assetNode');

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
    () => nodes.filter((n) => n.data.isInvestment || n.type === 'assetNode').map((n) => n.id),
    [nodes],
  );

  const prevInvestmentIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentSet = new Set(investmentNodeIds);
    const prevSet = prevInvestmentIds.current;

    setSelectedNodeIds((prev) => {
      if (prev.size === 0 && currentSet.size > 0) {
        prevInvestmentIds.current = currentSet;
        return currentSet;
      }
      const next = new Set<string>();
      for (const id of investmentNodeIds) {
        if (prevSet.has(id)) {
          if (prev.has(id)) next.add(id);
        } else {
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
          {t('emptyState.noNodes')}
        </Typography>
      </Box>
    );
  }

  if (!hasInvestmentNodes) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 500, textAlign: 'center' }}>
          {t('emptyState.noInvestments')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flex: 1, overflow: 'auto', py: 2, px: 2 }}>
      <Box sx={{ maxWidth: 1100, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {result && result.nodes.length > 0 && filteredResult && (
          <>
            <Paper sx={{ p: isMobile ? 2 : 3, display: 'flex', flexDirection: 'column', gap: 2.5 }} elevation={2}>
              {/* Narrative summary */}
              <NarrativeSummary
                result={filteredResult}
                baseResult={filteredBaseResult}
                currency={currency}
                horizonYears={horizonYears}
                hasActiveDeltas={hasActiveDeltas}
              />

              <Divider />

              {/* Controls bar */}
              <ControlsBar
                horizonYears={horizonYears}
                onHorizonChange={setHorizonYears}
                viewMode={chartViewMode}
                onViewModeChange={setChartViewMode}
                investmentNodes={result.nodes}
                selectedNodeIds={selectedNodeIds}
                onToggleNode={handleToggleNode}
                onToggleAll={handleToggleAll}
                nodeColorMap={nodeColorMap}
                contributionDeltas={contributionDeltas}
              />

              {/* Full-width chart */}
              <ProjectionChart
                result={filteredResult}
                baseResult={filteredBaseResult}
                currency={currency}
                viewMode={chartViewMode}
                nodeColorMap={nodeColorMap}
                height={isMobile ? 280 : 380}
              />

              <Divider />

              {/* Explore scenarios (above settings) */}
              <ScenarioExplorer
                result={result}
                currency={currency}
                nodeColorMap={nodeColorMap}
                nodes={nodes}
                edges={edges}
                contributionDeltas={contributionDeltas}
                onDeltaChange={handleDeltaChange}
                onClearAllDeltas={handleClearAllDeltas}
              />

              <Divider />

              {/* Investment settings cards */}
              <InvestmentSettingsCards
                result={result}
                currency={currency}
                onReturnChange={handleReturnChange}
                nodeColorMap={nodeColorMap}
                nodes={nodes}
                onGrowthChange={handleGrowthChange}
              />

              <Divider />

              {/* Collapsible Yearly Breakdown */}
              <Box data-tour="proj-table">
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  onClick={() => setTableExpanded((prev) => !prev)}
                  sx={{
                    cursor: 'pointer',
                    borderRadius: 1,
                    px: 1,
                    mx: -1,
                    py: 0.5,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t('table.yearlyBreakdown')}
                  </Typography>
                  {tableExpanded ? (
                    <ExpandLess sx={{ fontSize: 18, color: 'text.secondary' }} />
                  ) : (
                    <ExpandMore sx={{ fontSize: 18, color: 'text.secondary' }} />
                  )}
                </Stack>
                <Collapse in={tableExpanded}>
                  <Box sx={{ mt: 1.5 }}>
                    <ProjectionTable result={filteredResult} currency={currency} isMobile={isMobile} />
                  </Box>
                </Collapse>
              </Box>
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}
