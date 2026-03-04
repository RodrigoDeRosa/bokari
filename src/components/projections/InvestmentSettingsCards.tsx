import { useState, useMemo, useCallback } from 'react';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import AddIcon from '@mui/icons-material/Add';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import RemoveIcon from '@mui/icons-material/Remove';
import { useTranslation } from 'react-i18next';
import { getNumberLocale } from '../../utils/currency';
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
  const locale = getNumberLocale();
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
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
  const { t } = useTranslation('projections');
  const [expanded, setExpanded] = useState(false);

  const rows = result.nodes.map((node) => {
    const treeNode = nodes.find((n) => n.id === node.nodeId);
    const treeValue = treeNode?.data.value ?? 0;
    const isAsset = treeNode?.type === 'assetNode';
    const initialValue = isAsset ? (treeNode?.data.initialValue ?? 0) : 0;
    return {
      id: node.nodeId,
      label: node.label,
      expectedReturn: node.expectedReturn,
      treeValue,
      isAsset,
      initialValue,
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
    return `${t('settings.avgReturn', { return: weightedReturn.toFixed(1) })} · ${t('settings.incomeGrowth', { growth: avgGrowth.toFixed(1) })}`;
  }, [rows, rootNodes]);

  const step = useCallback((value: number, delta: number) => {
    const next = Math.round((value + delta) * 10) / 10;
    return Math.max(0, Math.min(100, next));
  }, []);

  const stepperSx = { width: 24, height: 24, border: 1, borderColor: 'divider' } as const;

  return (
    <Box data-tour="proj-settings">
      {/* Section header with hover */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setExpanded((prev) => !prev)}
        sx={{
          cursor: 'pointer',
          mb: expanded ? 1 : 0,
          borderRadius: 1,
          px: 1,
          mx: -1,
          py: 0.5,
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('settings.title')}
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
            : rows.length <= 4
              ? `repeat(${rows.length}, 1fr)`
              : 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 1,
        }}
      >
        {rows.map((row) => {
          const color = nodeColorMap.get(row.id) ?? '#00916e';

          return (
            <Box
              key={row.id}
              sx={{
                px: 1.5,
                py: 1,
                borderRadius: 1,
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'divider',
                transition: 'all 0.15s ease',
                '&:hover': {
                  borderColor: color,
                  boxShadow: `0 0 0 1px ${color}33`,
                },
              }}
            >
              {/* Header: color dot + label + monthly */}
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.75 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1, fontSize: 13 }}>{row.label}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                  {row.isAsset
                    ? `${fmt(row.initialValue, currency)} ${t('settings.initial')}`
                    : `${fmt(row.treeValue, currency)}/mo`}
                </Typography>
              </Stack>

              {/* Expected return with +/- */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="caption" color="text.secondary">{t('settings.return')}</Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <IconButton size="small" onClick={() => onReturnChange(row.id, step(row.expectedReturn, -0.5))} sx={stepperSx}>
                    <RemoveIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Typography variant="body2" fontWeight={600} sx={{ minWidth: 40, textAlign: 'center', fontSize: 13 }}>
                    {row.expectedReturn.toFixed(1)}%
                  </Typography>
                  <IconButton size="small" onClick={() => onReturnChange(row.id, step(row.expectedReturn, 0.5))} sx={stepperSx}>
                    <AddIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Stack>
              </Stack>
            </Box>
          );
        })}
      </Box>

      {/* Income growth */}
      {rootNodes.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('settings.incomeGrowthLabel')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : `repeat(${Math.min(rootNodes.length, 3)}, 1fr)`,
              gap: 1,
            }}
          >
            {rootNodes.map((root) => {
              const growth = root.data.annualGrowth ?? 0;
              return (
                <Stack key={root.id} direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>{root.data.label}</Typography>
                  <Stack direction="row" alignItems="center" spacing={0.5}>
                    <IconButton size="small" onClick={() => onGrowthChange(root.id, step(growth, -0.5))} sx={stepperSx}>
                      <RemoveIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Typography variant="body2" fontWeight={600} sx={{ minWidth: 48, textAlign: 'center', fontSize: 13 }}>
                      +{growth.toFixed(1)}%
                    </Typography>
                    <IconButton size="small" onClick={() => onGrowthChange(root.id, step(growth, 0.5))} sx={stepperSx}>
                      <AddIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Stack>
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
