import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import type { InvestmentProjectionResult } from '../../types';

interface InvestmentSummaryCardsProps {
  result: InvestmentProjectionResult;
  currency: string;
}

function fmt(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function InvestmentSummaryCards({ result, currency }: InvestmentSummaryCardsProps) {
  const cards = result.nodes.map((node) => {
    const last = node.yearlyData[node.yearlyData.length - 1];
    return {
      key: node.nodeId,
      label: node.label,
      expectedReturn: node.expectedReturn,
      monthlyContribution: node.yearlyData[0]?.monthlyContribution ?? 0,
      portfolioValue: last?.portfolioValue ?? 0,
      growth: last?.growth ?? 0,
    };
  });

  const totalLast = result.totals[result.totals.length - 1];
  const totalFirst = result.totals[0];

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
      {cards.map((card) => (
        <Card key={card.key} variant="outlined" sx={{ flex: '1 1 180px', minWidth: 180 }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="subtitle2" noWrap>
              {card.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {card.expectedReturn}% annual return
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {fmt(card.monthlyContribution, currency)}/mo
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5, color: '#00916e' }}>
              {fmt(card.portfolioValue, currency)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fmt(card.growth, currency)} growth
            </Typography>
          </CardContent>
        </Card>
      ))}

      {cards.length > 1 && totalLast && (
        <Card variant="outlined" sx={{ flex: '1 1 180px', minWidth: 180, bgcolor: 'action.hover' }}>
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Typography variant="subtitle2" noWrap>
              Total
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {cards.length} investments
            </Typography>
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {fmt(totalFirst?.monthlyContribution ?? 0, currency)}/mo
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5, color: '#00916e' }}>
              {fmt(totalLast.portfolioValue, currency)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fmt(totalLast.growth, currency)} growth
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
