import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Divider from '@mui/material/Divider';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import type { TabValue } from './Toolbar';

interface InstructionsProps {
  open: boolean;
  onClose: () => void;
  activeTab: TabValue;
  onRestartTour?: (tab: TabValue) => void;
}

const listStyle = { paddingLeft: 20, margin: '0 0 16px' } as const;

const BudgetContent = () => (
  <>
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Getting Started
    </Typography>
    <Typography variant="body2" paragraph>
      Bokari uses a tree model inspired by Zero-Based Budgeting. Your total income
      sits at the root, and every dollar flows down through branches into spending
      categories. The canvas lets you visually build and adjust this tree.
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Creating Nodes
    </Typography>
    <Typography variant="body2" paragraph>
      Drag a node type from the palette on the left side of the canvas and drop it
      onto the workspace. Each type has a colored dot so you can identify it at a glance.
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Connecting Nodes
    </Typography>
    <Typography variant="body2" paragraph>
      Drag from a node's output handle (bottom, black) to another node's input handle
      (top, white) to create a parent-child relationship. Values flow from parent to
      children automatically.
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Editing Values
    </Typography>
    <Typography variant="body2" paragraph>
      Click any field on a node to edit it inline. For proportional and relative nodes,
      the dollar value is computed automatically from the parent — just set the
      percentage or leave it as the remainder.
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Node Types
    </Typography>
    <Typography variant="body2" component="div">
      <ul style={listStyle}>
        <li><strong>Root Node:</strong> The starting point — enter your total income here.</li>
        <li><strong>Fixed Node:</strong> A constant amount (e.g. rent, subscriptions). Does not scale when income changes.</li>
        <li><strong>Proportional Node:</strong> Takes a percentage of its parent. Great for savings targets or percentage-based budgets.</li>
        <li><strong>Relative Node:</strong> Gets whatever is left after siblings are allocated. Useful for discretionary spending.</li>
        <li><strong>Aggregator Node:</strong> Sums values from multiple parents into one total. Use it to see combined spending across categories.</li>
        <li><strong>Fixed Group Node:</strong> Groups several fixed line items under one node. Handy for listing individual bills.</li>
      </ul>
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Tips
    </Typography>
    <Typography variant="body2" component="div">
      <ul style={listStyle}>
        <li><strong>Undo / Redo:</strong> Ctrl+Z and Ctrl+Shift+Z (Cmd on Mac).</li>
        <li><strong>Auto-layout:</strong> Use the toolbar button to tidy up node positions.</li>
        <li><strong>Save / Load:</strong> Your budget is saved to the browser. Use Ctrl+S to save manually.</li>
        <li><strong>Import / Export:</strong> Share your budget as a JSON file via the toolbar menu.</li>
        <li><strong>Delete:</strong> Select a node or edge and press Backspace/Delete.</li>
      </ul>
    </Typography>
  </>
);

const ProjectionsContent = () => (
  <>
    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Overview
    </Typography>
    <Typography variant="body2" paragraph>
      The Projections tab takes your current budget and simulates how your
      investments could grow over time. It uses the contribution amounts from your
      budget tree and applies compound growth to project future values.
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      The Chart
    </Typography>
    <Typography variant="body2" paragraph>
      The stacked area chart shows two layers: your cumulative contributions
      (what you put in) and the growth on top (what compounding earns you). Use the
      horizon presets (5y, 10y, 20y, 30y) to change the time window. You can also
      switch between a total portfolio view and a per-asset breakdown.
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Investment Settings
    </Typography>
    <Typography variant="body2" component="div">
      <ul style={listStyle}>
        <li><strong>Expected Return:</strong> Set the annual return rate for each investment with the slider. This drives the compound growth calculation.</li>
        <li><strong>Income Growth:</strong> If your income grows year-over-year, proportional contributions will increase accordingly.</li>
      </ul>
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      Explore Scenarios
    </Typography>
    <Typography variant="body2" paragraph>
      Adjust contribution amounts using the +/- buttons or by typing a value
      directly to see how changes affect your long-term projections. A delta indicator
      shows the difference from your original budget. Use the reset button to return
      a single item to its original value, or clear all overrides at once.
    </Typography>

    <Divider sx={{ my: 2 }} />

    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
      The Table
    </Typography>
    <Typography variant="body2" paragraph>
      Below the chart you'll find a year-by-year breakdown showing contributions,
      growth, and total portfolio value for each period. This gives you the exact
      numbers behind the chart.
    </Typography>
  </>
);

type DrawerTab = 'budget' | 'projections';

function appTabToDrawerTab(appTab: TabValue): DrawerTab {
  return appTab === 'graph' ? 'budget' : 'projections';
}

const Instructions = ({ open, onClose, activeTab, onRestartTour }: InstructionsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerTab, setDrawerTab] = useState<DrawerTab>(appTabToDrawerTab(activeTab));

  useEffect(() => {
    if (open) {
      setDrawerTab(appTabToDrawerTab(activeTab));
    }
  }, [open, activeTab]);

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: isMobile ? '100%' : 320, p: 2 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" fontWeight="bold">Help</Typography>
        <IconButton onClick={onClose} size="small" aria-label="Close help">
          <CloseIcon />
        </IconButton>
      </Box>

      {onRestartTour && (
        <Button
          size="small"
          variant="outlined"
          startIcon={<ReplayIcon />}
          onClick={() => onRestartTour(drawerTab === 'budget' ? 'graph' : 'projections')}
          sx={{ mb: 1.5, textTransform: 'none' }}
        >
          Restart {drawerTab === 'budget' ? 'Budget' : 'Projections'} Tour
        </Button>
      )}

      <Tabs
        value={drawerTab}
        onChange={(_, v: DrawerTab) => setDrawerTab(v)}
        sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}
      >
        <Tab label="Budget" value="budget" />
        <Tab label="Projections" value="projections" />
      </Tabs>

      {drawerTab === 'budget' ? <BudgetContent /> : <ProjectionsContent />}
    </Drawer>
  );
};

export default Instructions;
