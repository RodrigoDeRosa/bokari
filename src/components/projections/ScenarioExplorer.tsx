import { useState } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import Remove from '@mui/icons-material/Remove';
import Add from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
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
      {/* Compact investment boxes */}
      <Stack direction="row" flexWrap="wrap" gap={3} sx={{ mt: 1.5 }}>
        {rows.map((row) => {
          const color = nodeColorMap.get(row.id) ?? '#00916e';
          const delta = contributionDeltas.get(row.id) ?? 0;
          const adjusted = Math.round(Math.max(0, row.treeValue + delta));
          const step = row.treeValue >= 500 ? 100 : 50;

          return (
            <Stack
              key={row.id}
              spacing={0.75}
              sx={{
                position: 'relative',
                px: 1.25,
                py: 1,
                borderRadius: 1,
                border: 1,
                borderColor: delta !== 0 ? (delta > 0 ? 'rgba(0,145,110,0.4)' : 'rgba(237,108,2,0.4)') : 'divider',
              }}
            >
              {/* Label */}
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: 13 }}>{row.label}</Typography>
              </Stack>

              {/* Stepper — always centered */}
              <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                <IconButton
                  size="small"
                  onClick={() => onDeltaChange(row.id, delta - step)}
                  disabled={adjusted <= 0}
                  sx={{ width: 24, height: 24, border: 1, borderColor: 'divider' }}
                >
                  <Remove sx={{ fontSize: 14 }} />
                </IconButton>
                <Typography sx={{ minWidth: 72, textAlign: 'center', fontSize: 13, fontWeight: 600 }}>
                  {fmt(adjusted, currency)}/mo
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => onDeltaChange(row.id, delta + step)}
                  sx={{ width: 24, height: 24, border: 1, borderColor: 'divider' }}
                >
                  <Add sx={{ fontSize: 14 }} />
                </IconButton>
              </Stack>

              {/* Delta overlay chip */}
              {delta !== 0 && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    transform: 'translate(30%, -50%)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.25,
                    bgcolor: delta > 0 ? '#00916e' : '#ed6c02',
                    border: 1,
                    borderColor: delta > 0 ? '#00916e' : '#ed6c02',
                    borderRadius: 2,
                    px: 0.75,
                    py: 0.125,
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    component="span"
                    sx={{ color: '#fff', fontSize: 11, whiteSpace: 'nowrap', lineHeight: 1.4 }}
                  >
                    {delta > 0 ? '+' : ''}{fmt(delta, currency)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => onDeltaChange(row.id, 0)}
                    sx={{ width: 16, height: 16, color: 'rgba(255,255,255,0.8)' }}
                  >
                    <DeleteOutline sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              )}
            </Stack>
          );
        })}
      </Stack>

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
