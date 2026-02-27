import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { BokariNode, ProjectionDataPoint } from '../../types';
import { computeCompoundGrowth } from '../../utils/projections';
import NodeSelector from './NodeSelector';
import ProjectionChart from './ProjectionChart';
import ProjectionTable from './ProjectionTable';

interface CompoundGrowthSectionProps {
  nodes: BokariNode[];
  currency: string;
}

const TOTAL_KEY = '__total';
const CONTRIBUTIONS_KEY = '__contributions';
const GROWTH_KEY = '__growth';

export default function CompoundGrowthSection({ nodes, currency }: CompoundGrowthSectionProps) {
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [annualReturn, setAnnualReturn] = useState(7);
  const [horizonYears, setHorizonYears] = useState(20);

  const selectedNode = nodes.find((n) => n.id === selectedNodeIds[0]);
  const monthlyContribution = selectedNode?.data.value ?? 0;

  const data = useMemo((): ProjectionDataPoint[] => {
    if (!selectedNode || horizonYears <= 0) return [];

    const totals = computeCompoundGrowth(monthlyContribution, annualReturn, horizonYears);

    return totals.map((total, year) => {
      const contributions = monthlyContribution * year * 12;
      return {
        year,
        label: year === 0 ? 'Now' : `Year ${year}`,
        values: {
          [TOTAL_KEY]: total,
          [CONTRIBUTIONS_KEY]: contributions,
          [GROWTH_KEY]: total - contributions,
        },
      };
    });
  }, [selectedNode, monthlyContribution, annualReturn, horizonYears]);

  const series = [
    { id: TOTAL_KEY, label: 'Total Value', color: '#3a86ff' },
    { id: CONTRIBUTIONS_KEY, label: 'Contributions', color: '#00916e' },
    { id: GROWTH_KEY, label: 'Growth', color: '#ff006e' },
  ];

  const columns = [
    { id: TOTAL_KEY, label: 'Total Value' },
    { id: CONTRIBUTIONS_KEY, label: 'Contributions' },
    { id: GROWTH_KEY, label: 'Growth' },
  ];

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Compound Growth
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        See how a recurring monthly investment grows over time with compound returns.
      </Typography>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, alignItems: 'center' }}>
        <NodeSelector
          nodes={nodes}
          currency={currency}
          mode="single"
          selected={selectedNodeIds}
          onChange={setSelectedNodeIds}
          label="Monthly contribution from"
        />
        <TextField
          size="small"
          type="number"
          label="Annual return %"
          value={annualReturn}
          onChange={(e) => setAnnualReturn(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 0, max: 50, step: 0.5 } }}
          sx={{ width: 140 }}
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

      {data.length > 0 ? (
        <>
          <ProjectionChart data={data} series={series} currency={currency} />
          <Box sx={{ mt: 2 }}>
            <ProjectionTable data={data} columns={columns} currency={currency} />
          </Box>
        </>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
          Select a node to see compound growth projections.
        </Typography>
      )}
    </Box>
  );
}
