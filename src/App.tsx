import { useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme';
import GraphView from './components/Graph';
import ProjectionsTab from './components/projections/ProjectionsTab';
import Toolbar from './components/Toolbar';
import Instructions from './components/Instructions';
import { BudgetTreeProvider } from './context/BudgetTreeContext';
import type { TabValue } from './components/Toolbar';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabValue>('graph');
  const [helpOpen, setHelpOpen] = useState(() => {
    return !localStorage.getItem('bokari-help-dismissed');
  });

  const handleToggleHelp = () => {
    setHelpOpen((prev) => {
      if (!prev === false) {
        localStorage.setItem('bokari-help-dismissed', 'true');
      }
      return !prev;
    });
  };

  const handleCloseHelp = () => {
    setHelpOpen(false);
    localStorage.setItem('bokari-help-dismissed', 'true');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ReactFlowProvider>
        <BudgetTreeProvider>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
            <Toolbar
              onToggleHelp={handleToggleHelp}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
            {activeTab === 'graph' ? <GraphView /> : <ProjectionsTab />}
          </Box>
          <Instructions open={helpOpen} onClose={handleCloseHelp} />
        </BudgetTreeProvider>
      </ReactFlowProvider>
    </ThemeProvider>
  );
};

export default App;
