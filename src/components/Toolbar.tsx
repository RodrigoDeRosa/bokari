import { useEffect, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import MuiToolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';
import { useBudgetTree } from '../context/BudgetTreeContext';
import { supportedLanguages } from '../i18n';

const CURRENCIES = [
  'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'BRL', 'ARS',
  'MXN', 'CLP', 'COP', 'PEN', 'UYU', 'CNY', 'INR', 'KRW', 'SEK', 'NOK', 'DKK',
];

export type TabValue = 'graph' | 'projections';

interface ToolbarProps {
  onToggleHelp: () => void;
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
}

const Toolbar = ({ onToggleHelp, activeTab, onTabChange }: ToolbarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isGraph = activeTab === 'graph';
  const { t, i18n } = useTranslation();

  const {
    save,
    reset,
    undoAction,
    redoAction,
    canUndo,
    canRedo,
    exportGraph,
    importGraph,
    currency,
    setCurrency,
    autoLayout,
    switchTemplate,
  } = useBudgetTree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGraph) return;
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoAction();
      }
      if (mod && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        redoAction();
      }
      if (mod && e.key === 's') {
        e.preventDefault();
        save();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undoAction, redoAction, save, isGraph]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCurrencyChange = (e: SelectChangeEvent) => {
    setCurrency(e.target.value);
  };

  const handleLanguageChange = (e: SelectChangeEvent) => {
    const newLang = e.target.value;
    i18n.changeLanguage(newLang);
    switchTemplate(newLang);
  };

  const handleImportClick = () => {
    setMenuAnchor(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const json = event.target?.result as string;
      const error = importGraph(json);
      if (error) {
        setSnackbar({ open: true, message: t('snackbar.importFailed', { error }), severity: 'error' });
      } else {
        setSnackbar({ open: true, message: t('snackbar.importSuccess'), severity: 'success' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    save();
    setSnackbar({ open: true, message: t('snackbar.budgetSaved'), severity: 'success' });
  };

  const handleExport = () => {
    setMenuAnchor(null);
    exportGraph();
  };

  const handleResetClick = () => {
    setMenuAnchor(null);
    setResetDialogOpen(true);
  };

  const handleResetConfirm = () => {
    reset();
    setResetDialogOpen(false);
    setSnackbar({ open: true, message: t('snackbar.budgetReset'), severity: 'success' });
  };

  const handleHelpClick = () => {
    setMenuAnchor(null);
    onToggleHelp();
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    onTabChange(newValue);
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 10 }}>
        <MuiToolbar variant="dense" sx={{ gap: 0.5, minHeight: 48 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', mr: isMobile ? 0.5 : 1, color: 'primary.main', fontSize: isMobile ? 16 : 20 }}
          >
            {t('appName')}
          </Typography>

          <Tabs
            data-tour="toolbar-tabs"
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              minHeight: 36,
              mr: isMobile ? 0.5 : 1,
              '& .MuiTab-root': { minHeight: 36, py: 0, px: isMobile ? 1 : 2, fontSize: isMobile ? 12 : 13 },
            }}
          >
            <Tab label={t('tabs.budget')} value="graph" />
            <Tab label={t('tabs.projections')} value="projections" />
          </Tabs>

          {isGraph && !isMobile && (
            <Box data-tour="toolbar-actions" sx={{ display: 'flex', alignItems: 'center' }}>
              <Tooltip title={t('toolbar.undoTooltip')}>
                <span>
                  <IconButton size="small" onClick={undoAction} disabled={!canUndo} aria-label={t('toolbar.undo')}>
                    <UndoIcon fontSize={isMobile ? 'small' : 'medium'} />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={t('toolbar.redoTooltip')}>
                <span>
                  <IconButton size="small" onClick={redoAction} disabled={!canRedo} aria-label={t('toolbar.redo')}>
                    <RedoIcon fontSize={isMobile ? 'small' : 'medium'} />
                  </IconButton>
                </span>
              </Tooltip>

              <Tooltip title={t('toolbar.saveTooltip')}>
                <IconButton size="small" onClick={handleSave} aria-label={t('toolbar.save')}>
                  <SaveIcon fontSize={isMobile ? 'small' : 'medium'} />
                </IconButton>
              </Tooltip>

              <Tooltip title={t('toolbar.autoLayoutTooltip')}>
                <IconButton size="small" onClick={autoLayout} aria-label={t('toolbar.autoLayout')}>
                  <AccountTreeIcon fontSize={isMobile ? 'small' : 'medium'} />
                </IconButton>
              </Tooltip>
            </Box>
          )}

          {/* Desktop: show all controls inline */}
          {!isMobile && (
            <>
              {isGraph && (
                <>
                  <Tooltip title={t('toolbar.exportTooltip')}>
                    <IconButton size="small" onClick={exportGraph} aria-label={t('toolbar.exportBudget')}>
                      <FileDownloadIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t('toolbar.importTooltip')}>
                    <IconButton size="small" onClick={handleImportClick} aria-label={t('toolbar.importBudget')}>
                      <FileUploadIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}

              <Box data-tour="toolbar-locale" sx={{ display: 'flex', alignItems: 'center' }}>
              <Select
                size="small"
                value={currency}
                onChange={handleCurrencyChange}
                sx={{ ml: 1, minWidth: 80, height: 32 }}
                aria-label={t('toolbar.currency')}
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>

              <Select
                size="small"
                value={i18n.language}
                onChange={handleLanguageChange}
                sx={{ ml: 0.5, minWidth: 80, height: 32 }}
                aria-label={t('toolbar.language')}
              >
                {supportedLanguages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>{lang.label}</MenuItem>
                ))}
              </Select>
              </Box>

              <Box sx={{ flex: 1 }} />

              {isGraph && (
                <>
                  <Tooltip title={t('toolbar.resetTooltip')}>
                    <IconButton size="small" onClick={() => setResetDialogOpen(true)} aria-label={t('toolbar.resetBudget')}>
                      <RestartAltIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title={t('toolbar.help')}>
                    <IconButton data-tour="help-button" size="small" onClick={onToggleHelp} aria-label={t('toolbar.toggleHelp')}>
                      <HelpOutlineIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </>
          )}

          {/* Mobile: currency selector + language + overflow menu */}
          {isMobile && (
            <>
              <Box data-tour="toolbar-locale" sx={{ display: 'flex', alignItems: 'center' }}>
              <Select
                size="small"
                value={currency}
                onChange={handleCurrencyChange}
                sx={{ ml: 0.5, minWidth: 70, height: 28, fontSize: 13 }}
                aria-label={t('toolbar.currency')}
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>

              <Select
                size="small"
                value={i18n.language}
                onChange={handleLanguageChange}
                sx={{ ml: 0.5, minWidth: 70, height: 28, fontSize: 13 }}
                aria-label={t('toolbar.language')}
              >
                {supportedLanguages.map((lang) => (
                  <MenuItem key={lang.code} value={lang.code}>{lang.label}</MenuItem>
                ))}
              </Select>
              </Box>

              <Box sx={{ flex: 1 }} />

              {isGraph && (
                <IconButton
                  data-tour="mobile-menu"
                  size="small"
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  aria-label={t('toolbar.moreActions')}
                >
                  <MoreVertIcon />
                </IconButton>
              )}
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={() => { setMenuAnchor(null); undoAction(); }} disabled={!canUndo}>
                  <ListItemIcon><UndoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>{t('toolbar.undo')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { setMenuAnchor(null); redoAction(); }} disabled={!canRedo}>
                  <ListItemIcon><RedoIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>{t('toolbar.redo')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => { setMenuAnchor(null); handleSave(); }}>
                  <ListItemIcon><SaveIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>{t('toolbar.save')}</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleExport}>
                  <ListItemIcon><FileDownloadIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>{t('toolbar.export')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleImportClick}>
                  <ListItemIcon><FileUploadIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>{t('toolbar.import')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleResetClick}>
                  <ListItemIcon><RestartAltIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>{t('toolbar.reset')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleHelpClick}>
                  <ListItemIcon><HelpOutlineIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>{t('toolbar.help')}</ListItemText>
                </MenuItem>
              </Menu>
            </>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </MuiToolbar>
      </AppBar>

      <Dialog open={resetDialogOpen} onClose={() => setResetDialogOpen(false)}>
        <DialogTitle>{t('dialogs.resetTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('dialogs.resetMessage')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>{t('dialogs.cancel')}</Button>
          <Button onClick={handleResetConfirm} color="error" variant="contained">
            {t('dialogs.reset')}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default Toolbar;
