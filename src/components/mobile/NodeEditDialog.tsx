import { useState, useEffect, useMemo } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
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
import { useTranslation } from 'react-i18next';
import type { BokariNode, BokariEdge, NodeType, FixedGroupChild } from '../../types';

/** Returns IDs of all descendants of `nodeId` (to prevent circular parent assignment). */
function getDescendantIds(nodeId: string, edges: BokariEdge[]): Set<string> {
  const descendants = new Set<string>();
  const stack = [nodeId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    for (const edge of edges) {
      if (edge.source === current && !descendants.has(edge.target)) {
        descendants.add(edge.target);
        stack.push(edge.target);
      }
    }
  }
  return descendants;
}

/** Returns nodes that are valid parents for `nodeId` (not itself, not its descendants). */
function getValidParents(nodeId: string, nodes: BokariNode[], edges: BokariEdge[]): BokariNode[] {
  const descendants = getDescendantIds(nodeId, edges);
  return nodes.filter((n) => n.id !== nodeId && !descendants.has(n.id));
}

interface NodeEditDialogProps {
  node: BokariNode | null;
  open: boolean;
  onClose: () => void;
  onSave: (nodeId: string, updates: Record<string, unknown>) => void;
  onDelete: (nodeId: string) => void;
  onParentChange?: (nodeId: string, newParentId: string | null) => void;
  currency: string;
  nodes?: BokariNode[];
  edges?: BokariEdge[];
}

export default function NodeEditDialog({ node, open, onClose, onSave, onDelete, onParentChange, currency, nodes, edges }: NodeEditDialogProps) {
  const { t } = useTranslation();
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [proportion, setProportion] = useState('');
  const [annualGrowth, setAnnualGrowth] = useState('');
  const [isInvestment, setIsInvestment] = useState(false);
  const [expectedReturn, setExpectedReturn] = useState('7');
  const [children, setChildren] = useState<FixedGroupChild[]>([]);
  const [parentId, setParentId] = useState<string | null>(null);

  // Find current parent from edges
  const currentParentId = useMemo(() => {
    if (!node || !edges) return null;
    const incoming = edges.find((e) => e.target === node.id);
    return incoming?.source ?? null;
  }, [node, edges]);

  // Valid parents for the dropdown
  const validParents = useMemo(() => {
    if (!node || !nodes || !edges) return [];
    return getValidParents(node.id, nodes, edges);
  }, [node, nodes, edges]);

  const showParentSelector = !!nodes && !!edges && !!onParentChange;

  useEffect(() => {
    if (node) {
      setLabel(node.data.label || '');
      setValue(String(node.data.value || 0));
      setProportion(String(node.data.proportion ?? ''));
      setAnnualGrowth(String(node.data.annualGrowth || 0));
      setIsInvestment(node.data.isInvestment || false);
      setExpectedReturn(String(node.data.expectedReturn ?? 7));
      setChildren(node.data.children ? [...node.data.children] : []);
      setParentId(currentParentId);
    }
  }, [node, currentParentId]);

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

    // Handle parent change if the selector is active and value differs
    if (showParentSelector && parentId !== currentParentId) {
      onParentChange!(node.id, parentId);
    }

    onClose();
  };

  const handleDelete = () => {
    onDelete(node.id);
    onClose();
  };

  const addChild = () => {
    setChildren([...children, { id: `child-${Date.now()}`, label: t('editDialog.newItem'), value: 0 }]);
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
      <DialogTitle>{t('editDialog.title')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {/* Parent selector — only on mobile, skip for root nodes */}
          {showParentSelector && nodeType !== 'rootNode' && (
            <FormControl fullWidth>
              <InputLabel id="parent-select-label">{t('editDialog.parent')}</InputLabel>
              <Select
                labelId="parent-select-label"
                value={parentId ?? ''}
                label={t('editDialog.parent')}
                onChange={(e) => setParentId(e.target.value || null)}
              >
                <MenuItem value="">{t('editDialog.noParent')}</MenuItem>
                {validParents.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.data.label || p.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            label={t('editDialog.label')}
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            fullWidth
            autoFocus
          />

          {(nodeType === 'rootNode' || nodeType === 'fixedNode') && (
            <TextField
              label={t('editDialog.value')}
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              fullWidth
            />
          )}

          {nodeType === 'proportionalNode' && (
            <TextField
              label={t('editDialog.proportion')}
              type="number"
              value={proportion}
              onChange={(e) => setProportion(e.target.value)}
              fullWidth
            />
          )}

          {nodeType === 'rootNode' && (
            <TextField
              label={t('editDialog.annualGrowth')}
              type="number"
              value={annualGrowth}
              onChange={(e) => setAnnualGrowth(e.target.value)}
              fullWidth
              helperText={t('editDialog.growthHelper')}
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
                label={t('editDialog.tagInvestment')}
              />
              {isInvestment && (
                <TextField
                  label={t('editDialog.expectedReturn')}
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
                <Typography variant="subtitle2">{t('editDialog.subItems')}</Typography>
                <Button size="small" startIcon={<AddIcon />} onClick={addChild}>
                  {t('dialogs.add')}
                </Button>
              </Box>
              {children.map((child, i) => (
                <Stack key={child.id} direction="row" spacing={1} alignItems="center">
                  <TextField
                    label={t('editDialog.item')}
                    value={child.label}
                    onChange={(e) => updateChild(i, 'label', e.target.value)}
                    size="small"
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label={t('editDialog.value')}
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
          {t('dialogs.delete')}
        </Button>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={onClose}>{t('dialogs.cancel')}</Button>
          <Button onClick={handleSave} variant="contained">{t('dialogs.save')}</Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
