import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { InvestmentProjectionResult } from '../../types';

interface NarrativeSummaryProps {
  result: InvestmentProjectionResult;
  baseResult: InvestmentProjectionResult | null;
  currency: string;
  horizonYears: number;
  hasActiveDeltas: boolean;
}

function fmt(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

function bold(text: string) {
  return (
    <Typography component="span" sx={{ fontWeight: 700 }}>
      {text}
    </Typography>
  );
}

export default function NarrativeSummary({ result, baseResult, currency, horizonYears, hasActiveDeltas }: NarrativeSummaryProps) {
  const last = result.totals[result.totals.length - 1];
  if (!last) return null;

  const portfolio = last.portfolioValue;
  const contrib = last.cumulativeContributions;
  const growth = last.growth;
  const multiplier = contrib > 0 ? portfolio / contrib : 0;
  const monthlyContrib = result.totals[1]?.monthlyContribution ?? result.totals[0]?.monthlyContribution ?? 0;

  // Weighted average return: weight each node's expectedReturn by its monthly contribution
  const totalMonthly = result.nodes.reduce((sum, n) => sum + (n.yearlyData[0]?.monthlyContribution ?? 0), 0);
  const weightedReturn = totalMonthly > 0
    ? result.nodes.reduce((sum, n) => {
        const w = (n.yearlyData[0]?.monthlyContribution ?? 0) / totalMonthly;
        return sum + n.expectedReturn * w;
      }, 0)
    : 0;

  // What-if comparison
  const baseLast = baseResult?.totals[baseResult.totals.length - 1];
  const showWhatIf = hasActiveDeltas && baseLast;

  const baseMonthly = baseResult?.totals[1]?.monthlyContribution ?? baseResult?.totals[0]?.monthlyContribution ?? 0;
  const monthlyDiff = monthlyContrib - baseMonthly;
  const portfolioDiff = showWhatIf ? portfolio - baseLast.portfolioValue : 0;

  return (
    <Box>
      <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
        Investing {bold(fmt(monthlyContrib, currency) + '/mo')} at an average{' '}
        {bold(weightedReturn.toFixed(1) + '%')} return over {bold(`${horizonYears} years`)}:
      </Typography>

      {/* Prominent portfolio value */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, color: '#00916e', my: 0.75, lineHeight: 1.2 }}
      >
        {fmt(portfolio, currency)}
      </Typography>

      <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
        {fmt(contrib, currency)} in contributions +{' '}
        <Typography component="span" sx={{ fontWeight: 700, color: '#ff006e' }}>
          {fmt(growth, currency)}
        </Typography>
        {' '}compound growth
        {multiplier > 0 && <> ({bold(multiplier.toFixed(1) + 'x')} multiplier)</>}
      </Typography>

      {showWhatIf && (
        <Box
          sx={{
            mt: 1.5,
            px: 2,
            py: 1.25,
            borderRadius: 1,
            bgcolor: portfolioDiff >= 0 ? 'rgba(0,145,110,0.06)' : 'rgba(237,108,2,0.06)',
            borderLeft: 3,
            borderLeftColor: portfolioDiff >= 0 ? '#00916e' : '#ed6c02',
          }}
        >
          <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
            With your adjustments ({monthlyDiff >= 0 ? '+' : ''}{fmt(monthlyDiff, currency)}/mo),
            the portfolio reaches{' '}
            <Typography component="span" sx={{ fontWeight: 700, color: portfolioDiff >= 0 ? '#00916e' : '#ed6c02' }}>
              {fmt(portfolio, currency)}
            </Typography>
            {' '}&mdash;{' '}
            <Typography component="span" sx={{ fontWeight: 700 }}>
              {fmt(Math.abs(portfolioDiff), currency)} {portfolioDiff >= 0 ? 'more' : 'less'}
            </Typography>
            {' '}than the current plan.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
