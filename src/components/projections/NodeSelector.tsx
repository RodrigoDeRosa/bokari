import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import type { BokariNode, NodeType } from '../../types';
import { NODE_TYPE_COLORS } from '../../constants/nodeColors';

interface NodeSelectorProps {
  nodes: BokariNode[];
  currency: string;
  mode: 'single' | 'multi';
  selected: string[];
  onChange: (selected: string[]) => void;
  label?: string;
}

function formatValue(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function NodeSelector({ nodes, currency, mode, selected, onChange, label }: NodeSelectorProps) {
  if (mode === 'single') {
    return (
      <TextField
        select
        size="small"
        label={label ?? 'Select node'}
        value={selected[0] ?? ''}
        onChange={(e) => onChange(e.target.value ? [e.target.value] : [])}
        sx={{ minWidth: 220 }}
      >
        <MenuItem value="">
          <em>None</em>
        </MenuItem>
        {nodes.map((node) => (
          <MenuItem key={node.id} value={node.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: NODE_TYPE_COLORS[node.type as NodeType] ?? '#ccc',
                  flexShrink: 0,
                }}
              />
              <span>{node.data.label}</span>
              <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                ({formatValue(node.data.value, currency)})
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </TextField>
    );
  }

  return (
    <Box>
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
      )}
      <FormGroup sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 0 }}>
        {nodes.map((node) => (
          <FormControlLabel
            key={node.id}
            control={
              <Checkbox
                size="small"
                checked={selected.includes(node.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange([...selected, node.id]);
                  } else {
                    onChange(selected.filter((id) => id !== node.id));
                  }
                }}
                sx={{ color: NODE_TYPE_COLORS[node.type as NodeType] ?? '#ccc', '&.Mui-checked': { color: NODE_TYPE_COLORS[node.type as NodeType] ?? '#ccc' } }}
              />
            }
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <span style={{ fontSize: 14 }}>{node.data.label}</span>
                <Typography variant="caption" color="text.secondary">
                  ({formatValue(node.data.value, currency)})
                </Typography>
              </Box>
            }
          />
        ))}
      </FormGroup>
    </Box>
  );
}
