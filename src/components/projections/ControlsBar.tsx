import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import type { InvestmentNodeProjection } from '../../types';

const HORIZON_PRESETS = [5, 10, 15, 20, 30, 40];

interface ControlsBarProps {
  horizonYears: number;
  onHorizonChange: (years: number) => void;
  viewMode: 'total' | 'perAsset';
  onViewModeChange: (mode: 'total' | 'perAsset') => void;
  investmentNodes: InvestmentNodeProjection[];
  selectedNodeIds: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onToggleAll: () => void;
  nodeColorMap: Map<string, string>;
  contributionDeltas: Map<string, number>;
}

function contrastText(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#000' : '#fff';
}

export default function ControlsBar({
  horizonYears,
  onHorizonChange,
  viewMode,
  onViewModeChange,
  investmentNodes,
  selectedNodeIds,
  onToggleNode,
  onToggleAll,
  nodeColorMap,
  contributionDeltas,
}: ControlsBarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t } = useTranslation('projections');

  const allSelected = investmentNodes.length > 0 && investmentNodes.every((n) => selectedNodeIds.has(n.nodeId));

  return (
    <Box data-tour="proj-controls">
      {/* Row 1: Horizon slider + view toggle */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        alignItems={isMobile ? 'stretch' : 'center'}
        spacing={isMobile ? 1.5 : 2}
      >
        {/* Horizon presets */}
        <Stack direction="row" alignItems="center" spacing={1} sx={{ flex: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {t('controls.horizon')}
          </Typography>
          <ToggleButtonGroup
            size="small"
            value={horizonYears}
            exclusive
            onChange={(_e, val) => { if (val !== null) onHorizonChange(val); }}
          >
            {HORIZON_PRESETS.map((y) => (
              <ToggleButton key={y} value={y} sx={{ textTransform: 'none', px: 1.25, py: 0.25, minWidth: 0 }}>
                {t('controls.yearPreset', { y })}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>

        {/* View mode toggle */}
        <ToggleButtonGroup
          size="small"
          value={viewMode}
          exclusive
          onChange={(_e, val) => { if (val) onViewModeChange(val); }}
          sx={{ flexShrink: 0 }}
        >
          <ToggleButton value="total" sx={{ textTransform: 'none', px: 1.5 }}>{t('controls.total')}</ToggleButton>
          <ToggleButton value="perAsset" sx={{ textTransform: 'none', px: 1.5 }}>{t('controls.perAsset')}</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* Row 2: Investment filter chips */}
      {investmentNodes.length > 1 && (
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
          <Chip
            label={allSelected ? t('controls.all') : `${Array.from(selectedNodeIds).filter((id) => investmentNodes.some((n) => n.nodeId === id)).length}/${investmentNodes.length}`}
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
          {investmentNodes.map((node) => {
            const selected = selectedNodeIds.has(node.nodeId);
            const color = nodeColorMap.get(node.nodeId) ?? '#00916e';
            const textColor = contrastText(color);
            const delta = contributionDeltas.get(node.nodeId) ?? 0;
            const hasDelta = delta !== 0;
            return (
              <Chip
                key={node.nodeId}
                label={
                  <Stack direction="row" alignItems="center" spacing={0.5} component="span">
                    {hasDelta && (
                      <Box
                        component="span"
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          bgcolor: delta > 0 ? '#10b981' : '#f97316',
                          flexShrink: 0,
                        }}
                      />
                    )}
                    <span>{node.label}</span>
                  </Stack>
                }
                size="small"
                onClick={() => onToggleNode(node.nodeId)}
                sx={{
                  fontWeight: 600,
                  transition: 'all 0.15s',
                  ...(selected
                    ? {
                        bgcolor: color,
                        color: textColor,
                        '&:hover': { bgcolor: color, filter: 'brightness(0.9)' },
                      }
                    : {
                        opacity: 0.5,
                        borderColor: color,
                        color: 'text.primary',
                      }),
                }}
                variant={selected ? 'filled' : 'outlined'}
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
