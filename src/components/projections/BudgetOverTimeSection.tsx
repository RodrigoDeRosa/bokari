import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { BokariNode, BokariEdge, NodeType } from '../../types';
import { computeBudgetOverTime } from '../../utils/projections';
import { NODE_TYPE_COLORS } from '../../constants/nodeColors';
import NodeSelector from './NodeSelector';
import ProjectionChart from './ProjectionChart';
import ProjectionTable from './ProjectionTable';

interface BudgetOverTimeSectionProps {
  nodes: BokariNode[];
  edges: BokariEdge[];
  currency: string;
}

export default function BudgetOverTimeSection({ nodes, edges, currency }: BudgetOverTimeSectionProps) {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [annualGrowth, setAnnualGrowth] = useState(3);
  const [horizonYears, setHorizonYears] = useState(10);

  const data = useMemo(() => {
    if (selectedNodeIds.length === 0 || horizonYears <= 0) return [];
    return computeBudgetOverTime(nodes, edges, selectedNodeIds, annualGrowth, horizonYears);
  }, [nodes, edges, selectedNodeIds, annualGrowth, horizonYears]);

  const series = useMemo(() => {
    return selectedNodeIds.map((id) => {
      const node = nodes.find((n) => n.id === id);
      return {
        id,
        label: node?.data.label ?? id,
        color: NODE_TYPE_COLORS[(node?.type as NodeType) ?? 'rootNode'] ?? '#ccc',
      };
    });
  }, [selectedNodeIds, nodes]);

  const columns = series.map((s) => ({ id: s.id, label: s.label }));

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Budget Over Time
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        See how your budget allocations change if your income grows annually.
        Fixed nodes stay constant; proportional and relative nodes scale with income.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
        <TextField
          size="small"
          type="number"
          label="Annual income growth %"
          value={annualGrowth}
          onChange={(e) => setAnnualGrowth(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 0, max: 50, step: 0.5 } }}
          sx={{ width: 190 }}
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

      <NodeSelector
        nodes={nodes}
        currency={currency}
        mode="multi"
        selected={selectedNodeIds}
        onChange={setSelectedNodeIds}
        label="Select nodes to track"
      />

      {data.length > 0 ? (
        <Box sx={{ mt: 2 }}>
          <ProjectionChart data={data} series={series} currency={currency} />
          <Box sx={{ mt: 2 }}>
            <ProjectionTable data={data} columns={columns} currency={currency} />
          </Box>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
          Select nodes to see budget projections over time.
        </Typography>
      )}
    </Box>
  );
}
