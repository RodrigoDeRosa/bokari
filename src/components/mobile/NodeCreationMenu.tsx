import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import { useTranslation } from 'react-i18next';
import { NODE_TYPE_COLORS } from '../../constants/nodeColors';
import type { NodeType } from '../../types';

interface NodeCreationMenuProps {
  open: boolean;
  onClose: () => void;
  onCreate: (type: NodeType) => void;
  hasParent: boolean;
}

const NODE_OPTION_TYPES: NodeType[] = [
  'rootNode', 'fixedNode', 'proportionalNode', 'relativeNode', 'aggregatorNode', 'fixedGroupNode',
];

export default function NodeCreationMenu({ open, onClose, onCreate, hasParent }: NodeCreationMenuProps) {
  const { t } = useTranslation();

  const options = hasParent
    ? NODE_OPTION_TYPES.filter((type) => type !== 'rootNode')
    : NODE_OPTION_TYPES.filter((type) => type === 'rootNode' || type === 'aggregatorNode');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{t('mobile.addNodeTitle')}</DialogTitle>
      <List sx={{ pt: 0 }}>
        {options.map((type) => (
          <ListItemButton
            key={type}
            onClick={() => {
              onCreate(type);
              onClose();
            }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  bgcolor: NODE_TYPE_COLORS[type],
                }}
              />
            </ListItemIcon>
            <ListItemText primary={t(`nodeTypeLabels.${type}`)} secondary={t(`nodeDescriptions.${type}`)} />
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  );
}
