import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { NODE_TYPE_COLORS } from '../../constants/nodeColors';
import type { NodeType } from '../../types';

interface NodeCreationMenuProps {
  open: boolean;
  onClose: () => void;
  onCreate: (type: NodeType) => void;
  hasParent: boolean;
}

const NODE_OPTIONS: { type: NodeType; label: string; description: string }[] = [
  { type: 'rootNode', label: 'Income', description: 'Top-level income source' },
  { type: 'fixedNode', label: 'Fixed', description: 'Fixed amount (e.g. rent)' },
  { type: 'proportionalNode', label: 'Proportional', description: 'Percentage of parent' },
  { type: 'relativeNode', label: 'Remainder', description: 'Whatever is left over' },
  { type: 'aggregatorNode', label: 'Aggregator', description: 'Sum of its children' },
  { type: 'fixedGroupNode', label: 'Fixed Group', description: 'Group of fixed items' },
];

export default function NodeCreationMenu({ open, onClose, onCreate, hasParent }: NodeCreationMenuProps) {
  const options = hasParent
    ? NODE_OPTIONS.filter((o) => o.type !== 'rootNode')
    : NODE_OPTIONS;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Node</DialogTitle>
      <List sx={{ pt: 0 }}>
        {options.map((opt) => (
          <ListItemButton
            key={opt.type}
            onClick={() => {
              onCreate(opt.type);
              onClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: NODE_TYPE_COLORS[opt.type],
                }}
              />
            </ListItemIcon>
            <ListItemText primary={opt.label} secondary={opt.description} />
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  );
}
