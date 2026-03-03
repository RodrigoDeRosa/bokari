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
import { useTranslation } from 'react-i18next';
import { loadHelpNamespace } from '../i18n';
import type { TabValue } from './Toolbar';

interface InstructionsProps {
  open: boolean;
  onClose: () => void;
  activeTab: TabValue;
  onRestartTour?: (tab: TabValue) => void;
}

const listStyle = { paddingLeft: 20, margin: '0 0 16px' } as const;

const BudgetContent = () => {
  const { t } = useTranslation('help');

  return (
    <>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('budget.gettingStarted.title')}
      </Typography>
      <Typography variant="body2" paragraph>
        {t('budget.gettingStarted.body')}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('budget.creatingNodes.title')}
      </Typography>
      <Typography variant="body2" paragraph>
        {t('budget.creatingNodes.body')}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('budget.connectingNodes.title')}
      </Typography>
      <Typography variant="body2" paragraph>
        {t('budget.connectingNodes.body')}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('budget.editingValues.title')}
      </Typography>
      <Typography variant="body2" paragraph>
        {t('budget.editingValues.body')}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('budget.nodeTypes.title')}
      </Typography>
      <Typography variant="body2" component="div">
        <ul style={listStyle}>
          <li><strong>{t('budget.nodeTypes.rootNode.label')}</strong> {t('budget.nodeTypes.rootNode.description')}</li>
          <li><strong>{t('budget.nodeTypes.fixedNode.label')}</strong> {t('budget.nodeTypes.fixedNode.description')}</li>
          <li><strong>{t('budget.nodeTypes.proportionalNode.label')}</strong> {t('budget.nodeTypes.proportionalNode.description')}</li>
          <li><strong>{t('budget.nodeTypes.relativeNode.label')}</strong> {t('budget.nodeTypes.relativeNode.description')}</li>
          <li><strong>{t('budget.nodeTypes.aggregatorNode.label')}</strong> {t('budget.nodeTypes.aggregatorNode.description')}</li>
          <li><strong>{t('budget.nodeTypes.fixedGroupNode.label')}</strong> {t('budget.nodeTypes.fixedGroupNode.description')}</li>
        </ul>
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('budget.tips.title')}
      </Typography>
      <Typography variant="body2" component="div">
        <ul style={listStyle}>
          <li><strong>{t('budget.tips.undoRedo.label')}</strong> {t('budget.tips.undoRedo.tip')}</li>
          <li><strong>{t('budget.tips.autoLayout.label')}</strong> {t('budget.tips.autoLayout.tip')}</li>
          <li><strong>{t('budget.tips.saveLoad.label')}</strong> {t('budget.tips.saveLoad.tip')}</li>
          <li><strong>{t('budget.tips.importExport.label')}</strong> {t('budget.tips.importExport.tip')}</li>
          <li><strong>{t('budget.tips.delete.label')}</strong> {t('budget.tips.delete.tip')}</li>
        </ul>
      </Typography>
    </>
  );
};

const ProjectionsContent = () => {
  const { t } = useTranslation('help');

  return (
    <>
      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('projections.overview.title')}
      </Typography>
      <Typography variant="body2" paragraph>
        {t('projections.overview.body')}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('projections.chart.title')}
      </Typography>
      <Typography variant="body2" paragraph>
        {t('projections.chart.body')}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('projections.settings.title')}
      </Typography>
      <Typography variant="body2" component="div">
        <ul style={listStyle}>
          <li><strong>{t('projections.settings.expectedReturn.label')}</strong> {t('projections.settings.expectedReturn.tip')}</li>
          <li><strong>{t('projections.settings.incomeGrowth.label')}</strong> {t('projections.settings.incomeGrowth.tip')}</li>
        </ul>
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('projections.scenarios.title')}
      </Typography>
      <Typography variant="body2" paragraph>
        {t('projections.scenarios.body')}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
        {t('projections.table.title')}
      </Typography>
      <Typography variant="body2" paragraph>
        {t('projections.table.body')}
      </Typography>
    </>
  );
};

type DrawerTab = 'budget' | 'projections';

function appTabToDrawerTab(appTab: TabValue): DrawerTab {
  return appTab === 'graph' ? 'budget' : 'projections';
}

const Instructions = ({ open, onClose, activeTab, onRestartTour }: InstructionsProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { t, i18n } = useTranslation('help');
  const { t: tc } = useTranslation('common');
  const [drawerTab, setDrawerTab] = useState<DrawerTab>(appTabToDrawerTab(activeTab));
  const [helpLoaded, setHelpLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      setDrawerTab(appTabToDrawerTab(activeTab));
      loadHelpNamespace(i18n.language).then(() => setHelpLoaded(true));
    }
  }, [open, activeTab, i18n.language]);

  const tabLabel = drawerTab === 'budget' ? tc('tabs.budget') : tc('tabs.projections');

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{ '& .MuiDrawer-paper': { width: isMobile ? '100%' : 320, p: 2 } }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h6" fontWeight="bold">{t('drawerTitle')}</Typography>
        <IconButton onClick={onClose} size="small" aria-label={t('closeHelp')}>
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
          {t('restartTour', { tab: tabLabel })}
        </Button>
      )}

      <Tabs
        value={drawerTab}
        onChange={(_, v: DrawerTab) => setDrawerTab(v)}
        sx={{ mb: 2, minHeight: 36, '& .MuiTab-root': { minHeight: 36, py: 0.5 } }}
      >
        <Tab label={tc('tabs.budget')} value="budget" />
        <Tab label={tc('tabs.projections')} value="projections" />
      </Tabs>

      {helpLoaded && (drawerTab === 'budget' ? <BudgetContent /> : <ProjectionsContent />)}
    </Drawer>
  );
};

export default Instructions;
