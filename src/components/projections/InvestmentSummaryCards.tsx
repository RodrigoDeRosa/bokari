import { useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import Popover from '@mui/material/Popover';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
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
}

function fmt(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
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
}: InvestmentSummaryCardsProps) {
  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [popoverNodeId, setPopoverNodeId] = useState<string | null>(null);
  const [popoverType, setPopoverType] = useState<'return' | 'growth'>('return');

  const rows = result.nodes.map((node) => {
    const last = node.yearlyData[node.yearlyData.length - 1];
    const portfolioValue = last?.portfolioValue ?? 0;
    return {
      id: node.nodeId,
      label: node.label,
      expectedReturn: node.expectedReturn,
      portfolioValue,
    };
  });

  const selectedRows = rows.filter((r) => selectedNodeIds.has(r.id));
  const totalPortfolio = selectedRows.reduce((sum, r) => sum + r.portfolioValue, 0);

  const allSelected = rows.length > 0 && selectedRows.length === rows.length;
  const someSelected = selectedRows.length > 0 && selectedRows.length < rows.length;

  const handleChipClick = (e: React.MouseEvent<HTMLElement>, nodeId: string, type: 'return' | 'growth' = 'return') => {
    setPopoverAnchor(e.currentTarget);
    setPopoverNodeId(nodeId);
    setPopoverType(type);
  };

  const handlePopoverClose = () => {
    setPopoverAnchor(null);
    setPopoverNodeId(null);
  };

  const activeRow = rows.find((r) => r.id === popoverNodeId);

  const rootNodes = nodes.filter((n) => n.type === 'rootNode');
  const activeRoot = rootNodes.find((n) => n.id === popoverNodeId);

  const cellSx = { py: 0.75, px: 0.5, '&:first-of-type': { pl: 0 }, '&:last-of-type': { pr: 0 } } as const;

  return (
    <>
      <TableContainer sx={{ overflowX: 'hidden' }}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: 28 }} />
            <col />
            <col style={{ width: 52 }} />
            <col style={{ width: 80 }} />
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={cellSx} />
              <TableCell sx={cellSx}>Investment</TableCell>
              <TableCell sx={cellSx} align="right">Return</TableCell>
              <TableCell sx={cellSx} align="right">Final</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const selected = selectedNodeIds.has(row.id);
              const color = nodeColorMap.get(row.id) ?? '#00916e';
              return (
                <TableRow
                  key={row.id}
                  sx={{
                    opacity: selected ? 1 : 0.45,
                    transition: 'opacity 0.15s',
                  }}
                >
                  <TableCell padding="checkbox" sx={cellSx}>
                    <Checkbox
                      size="small"
                      checked={selected}
                      onChange={() => onToggleNode(row.id)}
                      sx={{ p: 0 }}
                    />
                  </TableCell>
                  <TableCell sx={cellSx}>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem' }}>{row.label}</Typography>
                    </Stack>
                  </TableCell>
                  <TableCell sx={cellSx} align="right">
                    <Box
                      onClick={(e) => handleChipClick(e, row.id)}
                      sx={{
                        display: 'inline-block',
                        cursor: 'pointer',
                        px: 0.5,
                        py: 0.25,
                        borderRadius: 1,
                        bgcolor: 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' },
                        transition: 'background-color 0.15s',
                      }}
                    >
                      <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.8rem' }}>
                        {row.expectedReturn.toFixed(1)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={cellSx} align="right">
                    <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#00916e', fontSize: '0.8rem' }}>
                      {fmt(row.portfolioValue, currency)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}

            {rows.length > 1 && (
              <TableRow sx={{ bgcolor: 'action.hover', '& td': { borderBottom: 'none' } }}>
                <TableCell padding="checkbox" sx={cellSx}>
                  <Checkbox
                    size="small"
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={onToggleAll}
                    sx={{ p: 0 }}
                  />
                </TableCell>
                <TableCell sx={cellSx}>
                  <Typography variant="body2" fontWeight={600}>
                    Total ({selectedRows.length} of {rows.length})
                  </Typography>
                </TableCell>
                <TableCell sx={cellSx} />
                <TableCell sx={cellSx} align="right">
                  <Typography variant="body2" fontWeight={600} noWrap sx={{ color: '#00916e', fontSize: '0.8rem' }}>
                    {fmt(totalPortfolio, currency)}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
                  onClick={(e) => handleChipClick(e, root.id, 'growth')}
                  sx={{ cursor: 'pointer' }}
                />
              );
            })}
          </Stack>
        </Box>
      )}

      <Popover
        open={Boolean(popoverAnchor)}
        anchorEl={popoverAnchor}
        onClose={handlePopoverClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        slotProps={{ paper: { sx: { p: 2, width: 220 } } }}
      >
        {popoverType === 'return' && activeRow && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {activeRow.label} — expected return
            </Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="body2">0%</Typography>
              <Typography variant="body2" fontWeight={700}>
                {activeRow.expectedReturn.toFixed(1)}%
              </Typography>
              <Typography variant="body2">20%</Typography>
            </Stack>
            <Slider
              size="small"
              value={activeRow.expectedReturn}
              min={0}
              max={20}
              step={0.5}
              onChange={(_e, val) => onReturnChange(activeRow.id, val as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v.toFixed(1)}%`}
            />
          </Stack>
        )}
        {popoverType === 'growth' && activeRoot && (
          <Stack spacing={1}>
            <Typography variant="caption" color="text.secondary">
              {activeRoot.data.label} — annual growth
            </Typography>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
              <Typography variant="body2">0%</Typography>
              <Typography variant="body2" fontWeight={700}>
                {(activeRoot.data.annualGrowth ?? 0).toFixed(1)}%
              </Typography>
              <Typography variant="body2">20%</Typography>
            </Stack>
            <Slider
              size="small"
              value={activeRoot.data.annualGrowth ?? 0}
              min={0}
              max={20}
              step={0.5}
              onChange={(_e, val) => onGrowthChange(activeRoot.id, val as number)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v.toFixed(1)}%`}
            />
          </Stack>
        )}
      </Popover>
    </>
  );
}
