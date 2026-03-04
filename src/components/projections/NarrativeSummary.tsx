import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Trans, useTranslation } from 'react-i18next';
import { getNumberLocale } from '../../utils/currency';
import type { InvestmentProjectionResult } from '../../types';
import { useBudgetTree } from '../../context/BudgetTreeContext';

interface NarrativeSummaryProps {
  result: InvestmentProjectionResult;
  baseResult: InvestmentProjectionResult | null;
  currency: string;
  horizonYears: number;
  hasActiveDeltas: boolean;
}

function fmt(value: number, currency: string): string {
  const locale = getNumberLocale();
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function NarrativeSummary({ result, baseResult, currency, horizonYears, hasActiveDeltas }: NarrativeSummaryProps) {
  const { t } = useTranslation('projections');
  const { nodes } = useBudgetTree();
  const last = result.totals[result.totals.length - 1];
  if (!last) return null;

  const portfolio = last.portfolioValue;
  const contrib = last.cumulativeContributions;
  const growth = last.growth;
  const multiplier = contrib > 0 ? portfolio / contrib : 0;
  const monthlyContrib = result.totals[1]?.monthlyContribution ?? result.totals[0]?.monthlyContribution ?? 0;

  // Compute total initial holdings from asset nodes in the result
  const totalInitialValue = result.nodes.reduce((sum, n) => {
    const node = nodes.find((nd) => nd.id === n.nodeId);
    return sum + (node?.type === 'assetNode' ? (node.data.initialValue ?? 0) : 0);
  }, 0);

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
    <Box data-tour="proj-summary">
      <Typography variant="body1" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
        {totalInitialValue > 0 ? (
          <Trans
            t={t}
            i18nKey="narrative.summaryWithHoldings"
            values={{ initial: fmt(totalInitialValue, currency), amount: fmt(monthlyContrib, currency), rate: weightedReturn.toFixed(1), years: horizonYears }}
            components={{ bold: <Typography component="span" sx={{ fontWeight: 700 }} /> }}
          />
        ) : (
          <Trans
            t={t}
            i18nKey="narrative.summary"
            values={{ amount: fmt(monthlyContrib, currency), rate: weightedReturn.toFixed(1), years: horizonYears }}
            components={{ bold: <Typography component="span" sx={{ fontWeight: 700 }} /> }}
          />
        )}
      </Typography>

      {/* Prominent portfolio value */}
      <Typography
        variant="h4"
        sx={{ fontWeight: 800, color: '#00916e', my: 0.75, lineHeight: 1.2 }}
      >
        {fmt(portfolio, currency)}
      </Typography>

      <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.secondary' }}>
        <Trans
          t={t}
          i18nKey="narrative.contributions"
          values={{ amount: fmt(contrib, currency) }}
          components={{ bold: <Typography component="span" sx={{ fontWeight: 700 }} /> }}
        />{' '}
        <Trans
          t={t}
          i18nKey="narrative.compoundGrowth"
          values={{ growth: fmt(growth, currency) }}
          components={{ bold: <Typography component="span" sx={{ fontWeight: 700, color: '#ff006e' }} /> }}
        />
        {multiplier > 0 && <> ({t('narrative.multiplier', { value: multiplier.toFixed(1) })})</>}
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
            <Trans
              t={t}
              i18nKey="narrative.whatIf"
              values={{
                diff: `${monthlyDiff >= 0 ? '+' : ''}${fmt(monthlyDiff, currency)}`,
                value: fmt(portfolio, currency),
                diffAmount: fmt(Math.abs(portfolioDiff), currency),
                comparison: portfolioDiff >= 0 ? t('narrative.more') : t('narrative.less'),
              }}
              components={{ bold: <Typography component="span" sx={{ fontWeight: 700, color: portfolioDiff >= 0 ? '#00916e' : '#ed6c02' }} /> }}
            />
          </Typography>
        </Box>
      )}
    </Box>
  );
}
