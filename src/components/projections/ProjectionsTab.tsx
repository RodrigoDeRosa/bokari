import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useBudgetTree } from '../../context/BudgetTreeContext';
import CompoundGrowthSection from './CompoundGrowthSection';
import BudgetOverTimeSection from './BudgetOverTimeSection';

export default function ProjectionsTab() {
  const { nodes, edges, currency } = useBudgetTree();

  if (nodes.length === 0) {
    return (
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No nodes in your budget graph yet. Switch to the Budget tab to create some nodes first.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        flex: 1,
        overflow: 'auto',
        py: 3,
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 900, mx: 'auto', display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 3 }} elevation={2}>
          <CompoundGrowthSection nodes={nodes} currency={currency} />
        </Paper>

        <Paper sx={{ p: 3 }} elevation={2}>
          <BudgetOverTimeSection nodes={nodes} edges={edges} currency={currency} />
        </Paper>
      </Box>
    </Box>
  );
}
