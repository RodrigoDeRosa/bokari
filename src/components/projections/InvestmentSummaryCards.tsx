import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import type { BokariNode, InvestmentProjectionResult } from '../../types';

interface InvestmentSummaryCardsProps {
  result: InvestmentProjectionResult;
  currency: string;
  onReturnChange: (nodeId: string, rate: number) => void;
  selectedNodeIds: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onToggleAll: () => void;
  nodeColorMap: Map<string, string>;
  nodes: BokariNode[];
  onGrowthChange: (nodeId: string, rate: number) => void;
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

function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000' : '#fff';
}

export default function InvestmentSummaryCards({
  result,
  currency,
  onReturnChange,
  selectedNodeIds,
  onToggleNode,
  onToggleAll,
  nodeColorMap,
  nodes,
  onGrowthChange,
  contributionDeltas,
  onDeltaChange,
  onClearAllDeltas,
}: InvestmentSummaryCardsProps) {
  const [expandedNodeId, setExpandedNodeId] = useState<string | null>(null);
  const [expandedGrowthNodeId, setExpandedGrowthNodeId] = useState<string | null>(null);

  const rows = result.nodes.map((node) => {
    const last = node.yearlyData[node.yearlyData.length - 1];
    const portfolioValue = last?.portfolioValue ?? 0;
    const monthlyContribution = node.yearlyData[0]?.monthlyContribution ?? 0;
    return {
      id: node.nodeId,
      label: node.label,
      expectedReturn: node.expectedReturn,
      portfolioValue,
      monthlyContribution,
    };
  });

  const selectedRows = rows.filter((r) => selectedNodeIds.has(r.id));
  const totalPortfolio = selectedRows.reduce((sum, r) => sum + r.portfolioValue, 0);

  const allSelected = rows.length > 0 && selectedRows.length === rows.length;

  const rootNodes = nodes.filter((n) => n.type === 'rootNode');

  // Expanded investment detail panel data
  const expandedRow = expandedNodeId ? rows.find((r) => r.id === expandedNodeId) : null;
  const expandedNode = expandedNodeId ? nodes.find((n) => n.id === expandedNodeId) : null;
  const expandedTreeValue = expandedNode?.data.value ?? 0;
  const expandedDelta = expandedNodeId ? (contributionDeltas.get(expandedNodeId) ?? 0) : 0;
  const expandedSliderMax = Math.max(expandedTreeValue, 250);

  // Expanded growth panel data
  const expandedGrowthRoot = expandedGrowthNodeId ? rootNodes.find((n) => n.id === expandedGrowthNodeId) : null;

  // Delta summary
  const activeDeltas = Array.from(contributionDeltas.entries())
    .filter(([, d]) => d !== 0)
    .map(([id, d]) => {
      const row = rows.find((r) => r.id === id);
      return { id, label: row?.label ?? id, delta: d };
    });
  const netDelta = activeDeltas.reduce((sum, d) => sum + d.delta, 0);

  return (
    <>
      {/* Investment toggle chips */}
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        {rows.length > 1 && (
          <Chip
            label={allSelected ? 'All' : `${selectedRows.length}/${rows.length}`}
            size="small"
            variant={allSelected ? 'filled' : 'outlined'}
            onClick={onToggleAll}
            sx={{
              fontWeight: 600,
              ...(allSelected && {
                bgcolor: 'text.primary',
                color: 'background.paper',
                '&:hover': { bgcolor: 'text.secondary' },
              }),
            }}
          />
        )}
        {rows.map((row) => {
          const selected = selectedNodeIds.has(row.id);
          const color = nodeColorMap.get(row.id) ?? '#00916e';
          const textColor = contrastText(color);
          const delta = contributionDeltas.get(row.id) ?? 0;
          const hasDelta = delta !== 0;
          return (
            <Chip
              key={row.id}
              label={
                <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                  {hasDelta && (
                    <Box
                      component="span"
                      sx={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        bgcolor: delta > 0 ? '#00916e' : '#ed6c02',
                        flexShrink: 0,
                      }}
                    />
                  )}
                  <span>{row.label}</span>
                </Stack>
              }
              size="small"
              onClick={() => onToggleNode(row.id)}
              deleteIcon={<TuneIcon sx={{ fontSize: 14 }} />}
              onDelete={() => setExpandedNodeId(expandedNodeId === row.id ? null : row.id)}
              sx={{
                fontWeight: 600,
                transition: 'all 0.15s',
                ...(selected
                  ? {
                      bgcolor: color,
                      color: textColor,
                      '&:hover': { bgcolor: color, filter: 'brightness(0.9)' },
                      '& .MuiChip-deleteIcon': { color: textColor, opacity: 0.7, '&:hover': { color: textColor, opacity: 1 } },
                    }
                  : {
                      opacity: 0.5,
                      borderColor: color,
                      color: 'text.primary',
                      '& .MuiChip-deleteIcon': { color: 'text.secondary' },
                    }),
              }}
              variant={selected ? 'filled' : 'outlined'}
            />
          );
        })}
      </Stack>

      {/* Inline detail panel for selected investment node */}
      <Collapse in={expandedNodeId !== null && expandedRow !== undefined}>
        {expandedRow && expandedNodeId && (
          <Box sx={{ mt: 1, p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
            {/* Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600}>{expandedRow.label}</Typography>
              <IconButton size="small" onClick={() => setExpandedNodeId(null)}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Stack>

            {/* Contribution (read-only) */}
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="caption" color="text.secondary">Contribution</Typography>
              <Typography variant="body2" color="text.secondary">
                {fmt(expandedTreeValue, currency)}/mo
              </Typography>
            </Stack>

            {/* Delta slider */}
            <Box sx={{ mt: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                <Typography variant="caption" color="text.secondary">What-if</Typography>
                <Typography variant="body2" fontWeight={700} sx={{ color: expandedDelta > 0 ? '#00916e' : expandedDelta < 0 ? '#ed6c02' : 'text.primary' }}>
                  {expandedDelta > 0 ? '+' : ''}{fmt(expandedDelta, currency)}
                </Typography>
              </Stack>
              <Slider
                size="small"
                value={expandedDelta}
                min={-expandedSliderMax}
                max={expandedSliderMax}
                step={Math.max(1, Math.round(expandedSliderMax / 100) * 5)}
                onChange={(_e, val) => onDeltaChange(expandedNodeId, val as number)}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v > 0 ? '+' : ''}${fmt(v, currency)}`}
                sx={{ '& .MuiSlider-thumb': { width: 14, height: 14 } }}
              />
            </Box>

            {/* Adjusted value */}
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="body2" fontWeight={600}>Adjusted</Typography>
              <Typography variant="body2" fontWeight={700} sx={{ color: '#00916e' }}>
                {fmt(Math.max(0, expandedTreeValue + expandedDelta), currency)}/mo
              </Typography>
            </Stack>

            {/* Reset button */}
            {expandedDelta !== 0 && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => onDeltaChange(expandedNodeId, 0)}
                sx={{ textTransform: 'none', fontSize: '0.75rem', mt: 1 }}
              >
                Reset
              </Button>
            )}

            <Divider sx={{ my: 1.5 }} />

            {/* Expected return */}
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="caption" color="text.secondary">Expected return</Typography>
              <Typography variant="body2" fontWeight={700}>
                {expandedRow.expectedReturn.toFixed(1)}%
              </Typography>
            </Stack>
            <Slider
              size="small"
              value={expandedRow.expectedReturn}
              min={0}
              max={20}
              step={0.5}
              onChange={(_e, val) => onReturnChange(expandedRow.id, val as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v.toFixed(1)}%`}
            />
          </Box>
        )}
      </Collapse>

      {/* Summary line */}
      {selectedRows.length > 0 && (
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            {selectedRows.length === rows.length ? 'All investments' : `${selectedRows.length} of ${rows.length} selected`}
          </Typography>
          <Typography variant="body2" fontWeight={700} sx={{ color: '#00916e' }}>
            {fmt(totalPortfolio, currency)}
          </Typography>
        </Stack>
      )}

      {/* Delta summary banner */}
      {activeDeltas.length > 0 && (
        <Box
          sx={{
            mt: 1.5,
            px: 1.5,
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

      {/* Income growth chips */}
      {rootNodes.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
            Income Growth
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75}>
            {rootNodes.map((root) => {
              const growth = root.data.annualGrowth ?? 0;
              return (
                <Chip
                  key={root.id}
                  label={`${root.data.label} +${growth.toFixed(1)}%/yr`}
                  size="small"
                  variant="outlined"
                  deleteIcon={<TuneIcon sx={{ fontSize: 14 }} />}
                  onDelete={() => setExpandedGrowthNodeId(expandedGrowthNodeId === root.id ? null : root.id)}
                  onClick={() => setExpandedGrowthNodeId(expandedGrowthNodeId === root.id ? null : root.id)}
                  sx={{ cursor: 'pointer' }}
                />
              );
            })}
          </Stack>

          {/* Inline growth detail panel */}
          <Collapse in={expandedGrowthNodeId !== null && expandedGrowthRoot !== undefined}>
            {expandedGrowthRoot && expandedGrowthNodeId && (
              <Box sx={{ mt: 1, p: 1.5, borderRadius: 1, bgcolor: 'action.hover' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                  <Typography variant="body2" fontWeight={600}>
                    {expandedGrowthRoot.data.label} — annual growth
                  </Typography>
                  <IconButton size="small" onClick={() => setExpandedGrowthNodeId(null)}>
                    <CloseIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                  <Typography variant="body2">0%</Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {(expandedGrowthRoot.data.annualGrowth ?? 0).toFixed(1)}%
                  </Typography>
                  <Typography variant="body2">20%</Typography>
                </Stack>
                <Slider
                  size="small"
                  value={expandedGrowthRoot.data.annualGrowth ?? 0}
                  min={0}
                  max={20}
                  step={0.5}
                  onChange={(_e, val) => onGrowthChange(expandedGrowthNodeId, val as number)}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(v) => `${v.toFixed(1)}%`}
                />
              </Box>
            )}
          </Collapse>
        </Box>
      )}
    </>
  );
}
