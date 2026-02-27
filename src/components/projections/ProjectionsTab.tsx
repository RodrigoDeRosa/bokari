import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useBudgetTree } from '../../context/BudgetTreeContext';
import { computeInvestmentProjection } from '../../utils/projections';
import InvestmentSummaryCards from './InvestmentSummaryCards';
import ProjectionChart from './ProjectionChart';
import ProjectionTable from './ProjectionTable';

export default function ProjectionsTab() {
  const { nodes, edges, currency } = useBudgetTree();
  const [incomeGrowthPct, setIncomeGrowthPct] = useState(0);
  const [horizonYears, setHorizonYears] = useState(20);

  const hasInvestmentNodes = nodes.some((n) => n.data.isInvestment);

  const result = useMemo(() => {
    if (!hasInvestmentNodes || horizonYears <= 0) {
      return null;
    }
    return computeInvestmentProjection(nodes, edges, incomeGrowthPct, horizonYears);
  }, [nodes, edges, incomeGrowthPct, horizonYears, hasInvestmentNodes]);

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
    <Box sx={{ flex: 1, overflow: 'auto', py: 3, px: 2 }}>
      <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 3 }} elevation={2}>
          <Typography variant="h6" gutterBottom>
            Investment Projections
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            See how your investment allocations compound into wealth over time.
            Each node uses its own expected annual return.
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField
              size="small"
              type="number"
              label="Income growth %/yr"
              value={incomeGrowthPct}
              onChange={(e) => setIncomeGrowthPct(Number(e.target.value))}
              slotProps={{ htmlInput: { min: 0, max: 50, step: 0.5 } }}
              sx={{ width: 160 }}
            />
            <TextField
              size="small"
              type="number"
              label="Horizon (years)"
              value={horizonYears}
              onChange={(e) => setHorizonYears(Math.max(1, Math.min(50, Number(e.target.value))))}
              slotProps={{ htmlInput: { min: 1, max: 50 } }}
              sx={{ width: 130 }}
            />
          </Box>
        </Paper>

        {result && result.nodes.length > 0 && (
          <>
            <InvestmentSummaryCards result={result} currency={currency} />

            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="subtitle1" gutterBottom>
                Portfolio Growth
              </Typography>
              <ProjectionChart result={result} currency={currency} />
            </Paper>

            <Paper sx={{ p: 3 }} elevation={2}>
              <Typography variant="subtitle1" gutterBottom>
                Yearly Breakdown
              </Typography>
              <ProjectionTable result={result} currency={currency} />
            </Paper>
          </>
        )}
      </Box>
    </Box>
  );
}
