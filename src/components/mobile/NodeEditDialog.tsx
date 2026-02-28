import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import type { BokariNode, NodeType, FixedGroupChild } from '../../types';

interface NodeEditDialogProps {
  node: BokariNode | null;
  open: boolean;
  onClose: () => void;
  onSave: (nodeId: string, updates: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
  currency: string;
}

export default function NodeEditDialog({ node, open, onClose, onSave, onDelete, currency }: NodeEditDialogProps) {
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [proportion, setProportion] = useState('');
  const [annualGrowth, setAnnualGrowth] = useState('');
  const [isInvestment, setIsInvestment] = useState(false);
  const [expectedReturn, setExpectedReturn] = useState('7');
  const [children, setChildren] = useState<FixedGroupChild[]>([]);

  useEffect(() => {
    if (node) {
      setLabel(node.data.label || '');
      setValue(String(node.data.value || 0));
      setProportion(String(node.data.proportion ?? ''));
      setAnnualGrowth(String(node.data.annualGrowth || 0));
      setIsInvestment(node.data.isInvestment || false);
      setExpectedReturn(String(node.data.expectedReturn ?? 7));
      setChildren(node.data.children ? [...node.data.children] : []);
    }
  }, [node]);

  if (!node) return null;

  const nodeType = node.type as NodeType;

  const handleSave = () => {
    const updates: Record<string, unknown> = { label };

    if (nodeType === 'rootNode') {
      updates.value = parseFloat(value) || 0;
      updates.annualGrowth = parseFloat(annualGrowth) || 0;
    }

    if (nodeType === 'fixedNode') {
      updates.value = parseFloat(value) || 0;
    }

    if (nodeType === 'proportionalNode') {
      updates.proportion = parseFloat(proportion) || 0;
    }

    if (nodeType === 'fixedGroupNode') {
      updates.children = children;
      updates.value = children.reduce((sum, c) => sum + (c.value || 0), 0);
    }

    if (['rootNode', 'fixedNode', 'proportionalNode', 'relativeNode'].includes(nodeType)) {
      updates.isInvestment = isInvestment;
      if (isInvestment) {
        updates.expectedReturn = parseFloat(expectedReturn) || 7;
      }
    }

    onSave(node.id, updates);
    onClose();
  };

  const handleDelete = () => {
    onDelete(node.id);
    onClose();
  };

  const addChild = () => {
    setChildren([...children, { id: `child-${Date.now()}`, label: 'New Item', value: 0 }]);
  };

  const removeChild = (index: number) => {
    setChildren(children.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: 'label' | 'value', val: string) => {
    setChildren(children.map((c, i) => {
      if (i !== index) return c;
      return { ...c, [field]: field === 'value' ? (parseFloat(val) || 0) : val };
    }));
  };

  const _ = currency; // available for future formatting needs

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Node</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            autoFocus
          />

          {(nodeType === 'rootNode' || nodeType === 'fixedNode') && (
            <TextField
              label="Value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              fullWidth
            />
          )}

          {nodeType === 'proportionalNode' && (
            <TextField
              label="Proportion (%)"
              type="number"
              value={proportion}
              onChange={(e) => setProportion(e.target.value)}
              fullWidth
            />
          )}

          {nodeType === 'rootNode' && (
            <TextField
              label="Annual Growth (%)"
              type="number"
              value={annualGrowth}
              onChange={(e) => setAnnualGrowth(e.target.value)}
              fullWidth
              helperText="Income growth per year"
            />
          )}

          {['rootNode', 'fixedNode', 'proportionalNode', 'relativeNode'].includes(nodeType) && (
            <>
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={isInvestment}
                    onChange={(e) => setIsInvestment(e.target.checked)}
                  />
                }
                label="Tag as investment"
              />
              {isInvestment && (
                <TextField
                  label="Expected Annual Return (%)"
                  type="number"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(e.target.value)}
                  fullWidth
                />
              )}
            </>
          )}

          {nodeType === 'fixedGroupNode' && (
            <>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2">Sub-items</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addChild}>
                  Add
                </Button>
              </Box>
              {children.map((child, i) => (
                <Stack key={child.id} direction="row" spacing={1} alignItems="center">
                  <TextField
                    label="Item"
                    value={child.label}
                    onChange={(e) => updateChild(i, 'label', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="Value"
                    type="number"
                    value={child.value}
                    onChange={(e) => updateChild(i, 'value', e.target.value)}
                    size="small"
                    sx={{ width: 100 }}
                  />
                  <IconButton size="small" onClick={() => removeChild(i)}>
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                </Stack>
              ))}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button onClick={handleDelete} color="error" startIcon={<DeleteIcon />}>
          Delete
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
