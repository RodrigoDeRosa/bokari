import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useTranslation } from 'react-i18next';
import type { NodeType } from '../types';
import { NODE_TYPE_COLORS } from '../constants/nodeColors';

const NODE_TYPE_ENTRIES: { type: NodeType; color: string }[] = [
  { type: 'rootNode', color: NODE_TYPE_COLORS.rootNode },
  { type: 'fixedNode', color: NODE_TYPE_COLORS.fixedNode },
  { type: 'proportionalNode', color: NODE_TYPE_COLORS.proportionalNode },
  { type: 'relativeNode', color: NODE_TYPE_COLORS.relativeNode },
  { type: 'aggregatorNode', color: NODE_TYPE_COLORS.aggregatorNode },
  { type: 'fixedGroupNode', color: NODE_TYPE_COLORS.fixedGroupNode },
  { type: 'assetNode', color: NODE_TYPE_COLORS.assetNode },
];

const NodeCreator = () => {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper
      data-tour="node-palette"
      elevation={0}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        borderRadius: 2,
        overflow: 'hidden',
        bgcolor: 'rgba(17,24,39,0.8)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          bgcolor: 'rgba(255,255,255,0.04)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <Typography variant="body2" fontWeight="bold">
          {t('palette.title')}
        </Typography>
        <IconButton size="small" aria-label={expanded ? t('palette.collapse') : t('palette.expand')}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', gap: 1, p: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {NODE_TYPE_ENTRIES.map(({ type, color }) => {
            const label = t(`nodeTypes.${type}`);
            return (
              <Tooltip key={type} title={t('palette.dragToCreate', { label })}>
                <Box
                  draggable
                  onDragStart={(e) => onDragStart(e, type)}
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    bgcolor: `${color}22`,
                    color: color,
                    border: `1px solid ${color}`,
                    borderRadius: 1,
                    fontSize: 13,
                    fontWeight: 'bold',
                    cursor: 'grab',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: `${color}33`, boxShadow: `0 0 12px ${color}40` },
                    '&:active': { cursor: 'grabbing' },
                  }}
                >
                  {label}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default NodeCreator;
