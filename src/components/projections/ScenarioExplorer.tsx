import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Remove from '@mui/icons-material/Remove';
import Add from '@mui/icons-material/Add';
import type { BokariNode, InvestmentProjectionResult } from '../../types';

interface ScenarioExplorerProps {
  result: InvestmentProjectionResult;
  currency: string;
  nodeColorMap: Map<string, string>;
  nodes: BokariNode[];
  contributionDeltas: Map<string, number>;
  onDeltaChange: (nodeId: string, delta: number) => void;
  onClearAllDeltas: () => void;
}

function fmt(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function ScenarioExplorer({
  result,
  currency,
  nodeColorMap,
  nodes,
  contributionDeltas,
  onDeltaChange,
  onClearAllDeltas,
}: ScenarioExplorerProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [expanded, setExpanded] = useState(false);

  const rows = result.nodes.map((node) => {
    const treeNode = nodes.find((n) => n.id === node.nodeId);
    const treeValue = treeNode?.data.value ?? 0;
    return {
      id: node.nodeId,
      label: node.label,
      treeValue,
    };
  });

  const activeDeltas = Array.from(contributionDeltas.entries())
    .filter(([, d]) => d !== 0)
    .map(([id, d]) => {
      const row = rows.find((r) => r.id === id);
      return { id, label: row?.label ?? id, delta: d };
    });
  const netDelta = activeDeltas.reduce((sum, d) => sum + d.delta, 0);

  return (
    <Box
      data-tour="proj-scenarios"
      sx={{
        px: isMobile ? 1.5 : 2,
        py: isMobile ? 1 : 1.5,
        borderRadius: 2,
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
        borderLeft: 3,
        borderColor: 'primary.main',
      }}
    >
      {/* Clickable section header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          cursor: 'pointer',
          borderRadius: 1,
          px: 1,
          mx: -1,
          py: 0.5,
          '&:hover': { bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)' },
        }}
      >
        <Stack spacing={0.25}>
          <Typography variant="subtitle1" fontWeight={700}>
            Explore Scenarios
          </Typography>
          {!expanded && (
            <Typography variant="caption" color="text.secondary">
              {activeDeltas.length > 0
                ? `${activeDeltas.length} adjustment${activeDeltas.length > 1 ? 's' : ''} · net ${netDelta > 0 ? '+' : ''}${fmt(netDelta, currency)}/mo`
                : 'Adjust monthly contributions to compare outcomes'}
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
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
        See how changing your monthly contributions would affect your portfolio over time.
      </Typography>

      {/* Per-asset cards grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: isMobile
            ? '1fr'
            : rows.length <= 3
              ? `repeat(${rows.length}, 1fr)`
              : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 1.5,
        }}
      >
        {rows.map((row) => {
          const color = nodeColorMap.get(row.id) ?? '#00916e';
          const delta = contributionDeltas.get(row.id) ?? 0;
          const adjusted = Math.round(Math.max(0, row.treeValue + delta));
          const step = row.treeValue >= 500 ? 100 : 50;

          return (
            <Box
              key={row.id}
              sx={{
                p: 1.5,
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
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Typography variant="body2" fontWeight={600}>{row.label}</Typography>
              </Stack>

              {/* Current value */}
              <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary">Current</Typography>
                <Typography variant="body2" color="text.secondary">
                  {fmt(row.treeValue, currency)}/mo
                </Typography>
              </Stack>

              {/* Number input with +/- steppers */}
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => onDeltaChange(row.id, delta - step)}
                  disabled={adjusted <= 0}
                  sx={{ border: 1, borderColor: 'divider', width: 32, height: 32 }}
                >
                  <Remove sx={{ fontSize: 16 }} />
                </IconButton>
                <TextField
                  type="number"
                  size="small"
                  value={adjusted}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      onDeltaChange(row.id, -row.treeValue);
                      return;
                    }
                    const parsed = Math.max(0, Math.round(Number(raw)));
                    onDeltaChange(row.id, parsed - row.treeValue);
                  }}
                  slotProps={{
                    input: {
                      endAdornment: <InputAdornment position="end">/mo</InputAdornment>,
                      inputProps: { min: 0, style: { MozAppearance: 'textfield' } },
                    },
                  }}
                  sx={{
                    flex: 1,
                    '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                      WebkitAppearance: 'none',
                      margin: 0,
                    },
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => onDeltaChange(row.id, delta + step)}
                  sx={{ border: 1, borderColor: 'divider', width: 32, height: 32 }}
                >
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              </Stack>

              {/* Delta feedback + reset */}
              {delta !== 0 && (
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.75 }}>
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ color: delta > 0 ? '#00916e' : '#ed6c02' }}
                  >
                    {delta > 0 ? '+' : ''}{fmt(delta, currency)}/mo
                  </Typography>
                  <Link
                    component="button"
                    variant="caption"
                    underline="hover"
                    onClick={() => onDeltaChange(row.id, 0)}
                    sx={{ color: 'text.secondary' }}
                  >
                    Reset
                  </Link>
                </Stack>
              )}
            </Box>
          );
        })}
      </Box>

      {/* Delta summary banner */}
      {activeDeltas.length > 0 && (
        <Box
          sx={{
            mt: 1.5,
            px: 2,
            py: 1,
            borderRadius: 1,
            bgcolor: netDelta > 0 ? 'rgba(0,145,110,0.08)' : 'rgba(237,108,2,0.08)',
            border: 1,
            borderColor: netDelta > 0 ? 'rgba(0,145,110,0.25)' : 'rgba(237,108,2,0.25)',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: netDelta > 0 ? '#00916e' : '#ed6c02' }}
            >
              {netDelta > 0
                ? `Investing ${fmt(netDelta, currency)} more per month`
                : `Keeping ${fmt(Math.abs(netDelta), currency)} more by not investing`}
            </Typography>
            <Link
              component="button"
              variant="caption"
              underline="hover"
              onClick={onClearAllDeltas}
              sx={{ color: 'text.secondary', whiteSpace: 'nowrap', ml: 1 }}
            >
              Clear all
            </Link>
          </Stack>
        </Box>
      )}
      </Collapse>
    </Box>
  );
}
