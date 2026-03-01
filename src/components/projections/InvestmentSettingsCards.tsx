import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import type { BokariNode, InvestmentProjectionResult } from '../../types';

interface InvestmentSettingsCardsProps {
  result: InvestmentProjectionResult;
  currency: string;
  onReturnChange: (nodeId: string, rate: number) => void;
  nodeColorMap: Map<string, string>;
  nodes: BokariNode[];
  onGrowthChange: (nodeId: string, rate: number) => void;
}

function fmt(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function InvestmentSettingsCards({
  result,
  currency,
  onReturnChange,
  nodeColorMap,
  nodes,
  onGrowthChange,
}: InvestmentSettingsCardsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(false);

  const rows = result.nodes.map((node) => {
    const treeNode = nodes.find((n) => n.id === node.nodeId);
    const treeValue = treeNode?.data.value ?? 0;
    return {
      id: node.nodeId,
      label: node.label,
      expectedReturn: node.expectedReturn,
      treeValue,
    };
  });

  const rootNodes = nodes.filter((n) => n.type === 'rootNode');

  // Collapsed summary: weighted avg return + avg income growth
  const collapsedSummary = useMemo(() => {
    const totalMonthly = rows.reduce((sum, r) => sum + r.treeValue, 0);
    const weightedReturn = totalMonthly > 0
      ? rows.reduce((sum, r) => sum + r.expectedReturn * (r.treeValue / totalMonthly), 0)
      : 0;
    const avgGrowth = rootNodes.length > 0
      ? rootNodes.reduce((sum, r) => sum + (r.data.annualGrowth ?? 0), 0) / rootNodes.length
      : 0;
    return `Avg ${weightedReturn.toFixed(1)}% return · Income +${avgGrowth.toFixed(1)}%/yr`;
  }, [rows, rootNodes]);

  return (
    <Box>
      {/* Section header with hover */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          cursor: 'pointer',
          mb: expanded ? 1.5 : 0,
          borderRadius: 1,
          px: 1,
          mx: -1,
          py: 0.5,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Investment Settings
          </Typography>
          {!expanded && (
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
              {collapsedSummary}
            </Typography>
          )}
        </Stack>
        {expanded ? (
          <ExpandLess sx={{ fontSize: 18, color: 'text.secondary' }} />
        ) : (
          <ExpandMore sx={{ fontSize: 18, color: 'text.secondary' }} />
        )}
      </Stack>

      <Collapse in={expanded}>

      {/* Investment cards grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : rows.length <= 3
              ? `repeat(${rows.length}, 1fr)`
              : 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 2,
        }}
      >
        {rows.map((row) => {
          const color = nodeColorMap.get(row.id) ?? '#00916e';

          return (
            <Box
              key={row.id}
              sx={{
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: color,
                  boxShadow: `0 0 0 1px ${color}33, 0 2px 8px ${color}22`,
                },
              }}
            >
              {/* Header: color dot + label */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Typography variant="body2" fontWeight={600}>{row.label}</Typography>
              </Stack>

              {/* Monthly contribution (read-only) */}
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                <Typography variant="caption" color="text.secondary">Monthly</Typography>
                <Typography variant="body2" color="text.secondary">
                  {fmt(row.treeValue, currency)}/mo
                </Typography>
              </Stack>

              <Divider sx={{ my: 1 }} />

              {/* Expected return slider */}
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="caption" color="text.secondary">Expected return</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {row.expectedReturn.toFixed(1)}%
                </Typography>
              </Stack>
              <Slider
                size="small"
                value={row.expectedReturn}
                min={0}
                max={20}
                step={0.5}
                onChange={(_e, val) => onReturnChange(row.id, val as number)}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v.toFixed(1)}%`}
                sx={{ '& .MuiSlider-thumb': { width: 14, height: 14 } }}
              />
            </Box>
          );
        })}
      </Box>

      {/* Income growth sliders */}
      {rootNodes.length > 0 && (
        <Box sx={{ mt: 2.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Income Growth
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(rootNodes.length, 3)}, 1fr)`,
              gap: 2,
            }}
          >
            {rootNodes.map((root) => {
              const growth = root.data.annualGrowth ?? 0;
              return (
                <Stack key={root.id} spacing={0.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography variant="body2" color="text.secondary">{root.data.label}</Typography>
                    <Typography variant="body2" fontWeight={600}>+{growth.toFixed(1)}%/yr</Typography>
                  </Stack>
                  <Slider
                    size="small"
                    value={growth}
                    min={0}
                    max={20}
                    step={0.5}
                    onChange={(_e, val) => onGrowthChange(root.id, val as number)}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(v) => `${v.toFixed(1)}%`}
                    sx={{ '& .MuiSlider-thumb': { width: 14, height: 14 } }}
                  />
                </Stack>
              );
            })}
          </Box>
        </Box>
      )}
      </Collapse>
    </Box>
  );
}
