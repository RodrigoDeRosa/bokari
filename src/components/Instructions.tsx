import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';

interface InstructionsProps {
  open: boolean;
  onClose: () => void;
}

const Instructions = ({ open, onClose }: InstructionsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: isMobile ? '100%' : 320, p: 2 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight="bold">Help</Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close help">
          <CloseIcon />
        </IconButton>
      </Box>

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        What is Bokari?
      </Typography>
      <Typography variant="body2" paragraph>
        Bokari is a personal finance tool inspired by the Zero-Based Budgeting principle.
        Start with your total budget as the root of a tree and allocate portions to various
        expenses, visualizing your financial plan. Each node represents a budget category
        with a name and value.
      </Typography>

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        How to Use
      </Typography>
      <Typography variant="body2" component="div">
        <ul style={{ paddingLeft: 20, margin: '0 0 16px' }}>
          <li><strong>Create Nodes:</strong> Drag nodes from the palette onto the canvas.</li>
          <li><strong>Edit Nodes:</strong> Click on a node's fields to edit them.</li>
          <li><strong>Connect Nodes:</strong> Drag from a black connector to a white connector to establish a parent-child relationship.</li>
          <li><strong>Delete:</strong> Select a node or edge and press Backspace/Delete.</li>
        </ul>
      </Typography>

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        Node Types
      </Typography>
      <Typography variant="body2" component="div">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li><strong>Root Node:</strong> The starting point of your budget tree.</li>
          <li><strong>Fixed Node:</strong> For regular expenses like rent or subscriptions.</li>
          <li><strong>Proportional Node:</strong> Allocates a percentage of the parent budget.</li>
          <li><strong>Relative Node:</strong> Shows the remaining budget after other expenses.</li>
          <li><strong>Aggregator Node:</strong> Sums values from multiple parent nodes.</li>
          <li><strong>Fixed Group Node:</strong> Groups similar fixed expenses together.</li>
        </ul>
      </Typography>

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
        Keyboard Shortcuts
      </Typography>
      <Typography variant="body2" component="div">
        <ul style={{ paddingLeft: 20, margin: 0 }}>
          <li><strong>Ctrl+Z:</strong> Undo</li>
          <li><strong>Ctrl+Shift+Z:</strong> Redo</li>
          <li><strong>Ctrl+S:</strong> Save</li>
          <li><strong>Backspace/Delete:</strong> Remove selected node or edge</li>
        </ul>
      </Typography>
    </Drawer>
  );
};

export default Instructions;
