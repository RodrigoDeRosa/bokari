import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { NodeType } from '../types';
import { NODE_TYPE_COLORS } from '../constants/nodeColors';

const NODE_TYPES: { type: NodeType; label: string; color: string }[] = [
  { type: 'rootNode', label: 'Root', color: NODE_TYPE_COLORS.rootNode },
  { type: 'fixedNode', label: 'Fixed', color: NODE_TYPE_COLORS.fixedNode },
  { type: 'proportionalNode', label: 'Proportional', color: NODE_TYPE_COLORS.proportionalNode },
  { type: 'relativeNode', label: 'Relative', color: NODE_TYPE_COLORS.relativeNode },
  { type: 'aggregatorNode', label: 'Aggregator', color: NODE_TYPE_COLORS.aggregatorNode },
  { type: 'fixedGroupNode', label: 'Fixed Group', color: NODE_TYPE_COLORS.fixedGroupNode },
];

const NodeCreator = () => {
  const [expanded, setExpanded] = useState(true);

  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        bottom: 16,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5,
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 0.5,
          bgcolor: 'grey.100',
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <Typography variant="body2" fontWeight="bold">
          Node Palette
        </Typography>
        <IconButton size="small" aria-label={expanded ? 'Collapse palette' : 'Expand palette'}>
          {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ display: 'flex', gap: 1, p: 1.5, flexWrap: 'wrap', justifyContent: 'center' }}>
          {NODE_TYPES.map(({ type, label, color }) => (
            <Tooltip key={type} title={`Drag to create a ${label} Node`}>
              <Box
                draggable
                onDragStart={(e) => onDragStart(e, type)}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  bgcolor: color,
                  color: 'white',
                  borderRadius: 1,
                  fontSize: 13,
                  fontWeight: 'bold',
                  cursor: 'grab',
                  whiteSpace: 'nowrap',
                  '&:hover': { opacity: 0.85 },
                  '&:active': { cursor: 'grabbing' },
                }}
              >
                {label}
              </Box>
            </Tooltip>
          ))}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default NodeCreator;
