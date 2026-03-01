import { useCallback, useEffect, useRef, useState } from 'react';
import { ReactFlowProvider } from '@xyflow/react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import theme from './theme';
import GraphView from './components/Graph';
import ProjectionsTab from './components/projections/ProjectionsTab';
import Toolbar from './components/Toolbar';
import Instructions from './components/Instructions';
import Tour, {
  BUDGET_TOUR_STEPS,
  MOBILE_BUDGET_TOUR_STEPS,
  PROJECTIONS_TOUR_STEPS,
} from './components/Tour';
import { BudgetTreeProvider, useBudgetTree } from './context/BudgetTreeContext';
import type { TabValue } from './components/Toolbar';

const AppContent: React.FC = () => {
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState<TabValue>('graph');
  const [helpOpen, setHelpOpen] = useState(false);
  const [budgetTourOpen, setBudgetTourOpen] = useState(() => {
    return !localStorage.getItem('bokari-tour-completed');
  });
  const [projTourOpen, setProjTourOpen] = useState(false);

  const { nodes } = useBudgetTree();
  const hasInvestmentNodes = nodes.some((n) => n.data.isInvestment);

  // Track whether we've already shown the projections tour this session
  const projTourTriggered = useRef(false);

  // Trigger projections tour on first visit to the tab (if not completed & has investment nodes)
  useEffect(() => {
    if (
      activeTab === 'projections' &&
      hasInvestmentNodes &&
      !projTourTriggered.current &&
      !localStorage.getItem('bokari-projections-tour-completed')
    ) {
      projTourTriggered.current = true;
      // Small delay to let projections content render and mount data-tour elements
      setTimeout(() => setProjTourOpen(true), 300);
    }
  }, [activeTab, hasInvestmentNodes]);

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

  const handleCloseBudgetTour = useCallback(() => {
    setBudgetTourOpen(false);
    localStorage.setItem('bokari-tour-completed', 'true');
  }, []);

  const handleCloseProjTour = useCallback(() => {
    setProjTourOpen(false);
    localStorage.setItem('bokari-projections-tour-completed', 'true');
  }, []);

  const handleRestartTour = useCallback((tab: TabValue) => {
    setHelpOpen(false);
    setActiveTab(tab);
    if (tab === 'graph') {
      localStorage.removeItem('bokari-tour-completed');
      setTimeout(() => setBudgetTourOpen(true), 100);
    } else {
      localStorage.removeItem('bokari-projections-tour-completed');
      projTourTriggered.current = true;
      setTimeout(() => setProjTourOpen(true), 300);
    }
  }, []);

  // Determine which tour is active
  const isBudgetTour = budgetTourOpen && activeTab === 'graph';
  const isProjTour = projTourOpen && activeTab === 'projections';
  const budgetSteps = isMobile ? MOBILE_BUDGET_TOUR_STEPS : BUDGET_TOUR_STEPS;

  return (
    <>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
        <Toolbar
          onToggleHelp={handleToggleHelp}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        {activeTab === 'graph' ? <GraphView /> : <ProjectionsTab />}
      </Box>
      <Instructions
        open={helpOpen}
        onClose={handleCloseHelp}
        activeTab={activeTab}
        onRestartTour={handleRestartTour}
      />
      {isBudgetTour && (
        <Tour open steps={budgetSteps} onClose={handleCloseBudgetTour} />
      )}
      {isProjTour && (
        <Tour open steps={PROJECTIONS_TOUR_STEPS} onClose={handleCloseProjTour} />
      )}
    </>
  );
};

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <ReactFlowProvider>
      <BudgetTreeProvider>
        <AppContent />
      </BudgetTreeProvider>
    </ReactFlowProvider>
  </ThemeProvider>
);

export default App;
