import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import EditIcon from '@mui/icons-material/Edit';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useTranslation } from 'react-i18next';
import { NODE_TYPE_COLORS } from '../../constants/nodeColors';
import { getNumberLocale } from '../../utils/currency';
import type { BokariNode, NodeType } from '../../types';

interface BudgetNodeCardProps {
  node: BokariNode;
  childCount: number;
  onDrillDown: (id: string) => void;
  onEdit: (id: string) => void;
  currency: string;
}

function fmtValue(value: number, currency: string): string {
  return new Intl.NumberFormat(getNumberLocale(), { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function BudgetNodeCard({ node, childCount, onDrillDown, onEdit, currency }: BudgetNodeCardProps) {
  const { t } = useTranslation();
  const { t: tn } = useTranslation('nodes');
  const nodeType = node.type as NodeType;
  const borderColor = NODE_TYPE_COLORS[nodeType] ?? '#ccc';
  const { label, value, proportion, annualGrowth, isInvestment, expectedReturn, children } = node.data;

  const content = (
    <Box sx={{ p: 2, pr: 6, position: 'relative' }}>
      {/* Edit button — positioned top-right, stops propagation to avoid drill-down */}
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onEdit(node.id);
        }}
        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        aria-label={tn('edit', { label })}
      >
        <EditIcon fontSize="small" />
      </IconButton>

      {/* Row 1: Label + Value */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
          {label}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, ml: 2, whiteSpace: 'nowrap' }}>
          {fmtValue(value, currency)}
        </Typography>
      </Box>

      {/* Row 2: Type chip + badges */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
        <Chip label={t(`nodeTypeLabels.${nodeType}`)} size="small" sx={{ fontSize: 11, height: 22 }} />

        {nodeType === 'rootNode' && annualGrowth != null && annualGrowth > 0 && (
          <Chip label={`+${annualGrowth}%/yr`} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
        )}
        {nodeType === 'proportionalNode' && proportion != null && (
          <Chip label={`${proportion}%`} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
        )}
        {nodeType === 'relativeNode' && (
          <Chip label={t('nodeTypeLabels.relativeNode')} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
        )}
        {nodeType === 'aggregatorNode' && (
          <Chip label={t('nodeTypeLabels.aggregatorNode')} size="small" variant="outlined" sx={{ fontSize: 11, height: 22 }} />
        )}

        {isInvestment && (
          <Chip
            icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
            label={`@${expectedReturn ?? 7}%`}
            size="small"
            variant="outlined"
            color="success"
            sx={{ fontSize: 11, height: 22 }}
          />
        )}
      </Box>

      {/* FixedGroupNode: show inline children list */}
      {nodeType === 'fixedGroupNode' && children && children.length > 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: 12 }}>
          {children.map((c) => `${c.label} ${fmtValue(c.value, currency)}`).join(', ')}
        </Typography>
      )}

      {/* Drill-down indicator */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 1 }}>
        {childCount > 0 && (
          <Typography variant="caption" color="text.secondary">
            {t('mobile.itemCount', { count: childCount })}
          </Typography>
        )}
        <ChevronRightIcon fontSize="small" color="action" />
      </Box>
    </Box>
  );

  return (
    <Card
      elevation={1}
      sx={{
        borderLeft: `4px solid ${borderColor}`,
        '&:not(:last-child)': { mb: 1 },
      }}
    >
      <CardActionArea onClick={() => onDrillDown(node.id)}>
        {content}
      </CardActionArea>
    </Card>
  );
}
