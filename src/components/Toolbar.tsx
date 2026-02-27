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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
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
import type { SelectChangeEvent } from '@mui/material/Select';
import { useBudgetTree } from '../context/BudgetTreeContext';

const CURRENCIES = [
  'EUR', 'USD', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'BRL', 'ARS',
  'MXN', 'CLP', 'COP', 'PEN', 'UYU', 'CNY', 'INR', 'KRW', 'SEK', 'NOK', 'DKK',
];

interface ToolbarProps {
  onToggleHelp: () => void;
}

const Toolbar = ({ onToggleHelp }: ToolbarProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
  } = useBudgetTree();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [undoAction, redoAction, save]);

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
        setSnackbar({ open: true, message: `Import failed: ${error}`, severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Budget imported successfully', severity: 'success' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    save();
    setSnackbar({ open: true, message: 'Budget saved', severity: 'success' });
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
    setSnackbar({ open: true, message: 'Budget reset to example', severity: 'success' });
  };

  const handleHelpClick = () => {
    setMenuAnchor(null);
    onToggleHelp();
  };

  return (
    <>
      <AppBar position="static" color="default" elevation={1} sx={{ zIndex: 10 }}>
        <MuiToolbar variant="dense" sx={{ gap: 0.5, minHeight: 48 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', mr: isMobile ? 1 : 2, color: 'primary.main', fontSize: isMobile ? 16 : 20 }}
          >
            Bokari
          </Typography>

          <Tooltip title="Undo (Ctrl+Z)">
            <span>
              <IconButton size="small" onClick={undoAction} disabled={!canUndo} aria-label="Undo">
                <UndoIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Redo (Ctrl+Shift+Z)">
            <span>
              <IconButton size="small" onClick={redoAction} disabled={!canRedo} aria-label="Redo">
                <RedoIcon fontSize={isMobile ? 'small' : 'medium'} />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Save (Ctrl+S)">
            <IconButton size="small" onClick={handleSave} aria-label="Save">
              <SaveIcon fontSize={isMobile ? 'small' : 'medium'} />
            </IconButton>
          </Tooltip>

          {/* Desktop: show all controls inline */}
          {!isMobile && (
            <>
              <Tooltip title="Export as JSON">
                <IconButton size="small" onClick={exportGraph} aria-label="Export budget">
                  <FileDownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Import JSON">
                <IconButton size="small" onClick={handleImportClick} aria-label="Import budget">
                  <FileUploadIcon />
                </IconButton>
              </Tooltip>

              <Select
                size="small"
                value={currency}
                onChange={handleCurrencyChange}
                sx={{ ml: 1, minWidth: 80, height: 32 }}
                aria-label="Currency"
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>

              <Box sx={{ flex: 1 }} />

              <Tooltip title="Reset to example">
                <IconButton size="small" onClick={() => setResetDialogOpen(true)} aria-label="Reset budget">
                  <RestartAltIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Help">
                <IconButton size="small" onClick={onToggleHelp} aria-label="Toggle help">
                  <HelpOutlineIcon />
                </IconButton>
              </Tooltip>
            </>
          )}

          {/* Mobile: currency selector + overflow menu */}
          {isMobile && (
            <>
              <Select
                size="small"
                value={currency}
                onChange={handleCurrencyChange}
                sx={{ ml: 0.5, minWidth: 70, height: 28, fontSize: 13 }}
                aria-label="Currency"
              >
                {CURRENCIES.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>

              <Box sx={{ flex: 1 }} />

              <IconButton
                size="small"
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                aria-label="More actions"
              >
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
              >
                <MenuItem onClick={handleExport}>
                  <ListItemIcon><FileDownloadIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Export</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleImportClick}>
                  <ListItemIcon><FileUploadIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Import</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleResetClick}>
                  <ListItemIcon><RestartAltIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Reset</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleHelpClick}>
                  <ListItemIcon><HelpOutlineIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Help</ListItemText>
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
        <DialogTitle>Reset Budget?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will replace your current budget with the example data. This action can be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleResetConfirm} color="error" variant="contained">
            Reset
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
