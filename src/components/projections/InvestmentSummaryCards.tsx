import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Checkbox from '@mui/material/Checkbox';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import type { InvestmentProjectionResult } from '../../types';

interface InvestmentSummaryCardsProps {
  result: InvestmentProjectionResult;
  currency: string;
  onReturnChange: (nodeId: string, rate: number) => void;
  selectedNodeIds: Set<string>;
  onToggleNode: (nodeId: string) => void;
  onToggleAll: () => void;
  nodeColorMap: Map<string, string>;
}

function fmt(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

function Sparkline({ data, color, id }: { data: number[]; color: string; id: string }) {
  const chartData = data.map((v, i) => ({ v, i }));
  const gradientId = `spark-${id}`;
  return (
    <Box sx={{ width: '100%', height: 40, mt: 1 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            fill={`url(#${gradientId})`}
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

export default function InvestmentSummaryCards({
  result,
  currency,
  onReturnChange,
  selectedNodeIds,
  onToggleNode,
  onToggleAll,
  nodeColorMap,
}: InvestmentSummaryCardsProps) {
  const cards = result.nodes.map((node) => {
    const last = node.yearlyData[node.yearlyData.length - 1];
    const portfolioValue = last?.portfolioValue ?? 0;
    const cumulativeContributions = last?.cumulativeContributions ?? 0;
    const multiplier = cumulativeContributions > 0 ? portfolioValue / cumulativeContributions : 0;
    const sparkData = node.yearlyData.slice(1).map((yd) => yd.portfolioValue);
    return {
      key: node.nodeId,
      label: node.label,
      expectedReturn: node.expectedReturn,
      monthlyContribution: node.yearlyData[0]?.monthlyContribution ?? 0,
      portfolioValue,
      growth: last?.growth ?? 0,
      multiplier,
      sparkData,
    };
  });

  // Compute totals from only selected nodes
  const selectedCards = cards.filter((c) => selectedNodeIds.has(c.key));
  const totalPortfolio = selectedCards.reduce((sum, c) => sum + c.portfolioValue, 0);
  const totalGrowth = selectedCards.reduce((sum, c) => sum + c.growth, 0);
  const totalMonthly = selectedCards.reduce((sum, c) => sum + c.monthlyContribution, 0);
  const totalContributions = selectedCards.reduce((sum, c) => {
    const last = result.nodes.find((n) => n.nodeId === c.key)?.yearlyData;
    return sum + (last?.[last.length - 1]?.cumulativeContributions ?? 0);
  }, 0);
  const totalMultiplier = totalContributions > 0 ? totalPortfolio / totalContributions : 0;

  // Compute total sparkline data from selected nodes
  const totalSparkData: number[] = [];
  if (selectedCards.length > 0) {
    const yearCount = result.nodes[0]?.yearlyData.length ?? 0;
    for (let i = 1; i < yearCount; i++) {
      let sum = 0;
      for (const node of result.nodes) {
        if (selectedNodeIds.has(node.nodeId)) {
          sum += node.yearlyData[i].portfolioValue;
        }
      }
      totalSparkData.push(sum);
    }
  }

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
      {cards.map((card) => {
        const selected = selectedNodeIds.has(card.key);
        const color = nodeColorMap.get(card.key) ?? '#00916e';
        return (
          <Card
            key={card.key}
            variant="outlined"
            sx={{
              flex: '1 1 220px',
              minWidth: 220,
              opacity: selected ? 1 : 0.45,
              borderLeft: selected ? `3px solid ${color}` : '3px solid transparent',
              transition: 'opacity 0.15s, border-color 0.15s',
            }}
          >
            <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Checkbox
                  size="small"
                  checked={selected}
                  onChange={() => onToggleNode(card.key)}
                  sx={{ p: 0, mr: 0.5 }}
                />
                <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
                  {card.label}
                </Typography>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 1.5 }}>
                <TrendingUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Expected return: {card.expectedReturn.toFixed(1)}%
                </Typography>
              </Stack>
              <Slider
                size="small"
                value={card.expectedReturn}
                min={0}
                max={20}
                step={0.5}
                onChange={(_e, val) => onReturnChange(card.key, val as number)}
                valueLabelDisplay="auto"
                valueLabelFormat={(v) => `${v.toFixed(1)}%`}
                sx={{ mt: 0, mb: 0.5, mx: 0.5 }}
              />

              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {fmt(card.monthlyContribution, currency)}/mo contribution
              </Typography>
              <Typography variant="h6" sx={{ mt: 0.5, color: '#00916e', fontWeight: 700 }}>
                {fmt(card.portfolioValue, currency)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {fmt(card.growth, currency)} growth
              </Typography>

              {card.sparkData.length > 1 && (
                <Sparkline data={card.sparkData} color={color} id={card.key} />
              )}
              {card.multiplier > 0 && (
                <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                  {card.multiplier.toFixed(1)}x your money
                </Typography>
              )}
            </CardContent>
          </Card>
        );
      })}

      {cards.length > 1 && (
        <Card
          variant="outlined"
          sx={{
            flex: '1 1 220px',
            minWidth: 220,
            bgcolor: 'action.hover',
          }}
        >
          <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Checkbox
                size="small"
                checked={selectedCards.length === cards.length}
                indeterminate={selectedCards.length > 0 && selectedCards.length < cards.length}
                onChange={onToggleAll}
                sx={{ p: 0, mr: 0.5 }}
              />
              <Typography variant="subtitle2" noWrap sx={{ flex: 1 }}>
                Total
              </Typography>
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }} component="div">
              {selectedCards.length} of {cards.length} investments
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {fmt(totalMonthly, currency)}/mo contribution
            </Typography>
            <Typography variant="h6" sx={{ mt: 0.5, color: '#00916e', fontWeight: 700 }}>
              {fmt(totalPortfolio, currency)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {fmt(totalGrowth, currency)} growth
            </Typography>

            {totalSparkData.length > 1 && (
              <Sparkline data={totalSparkData} color="#00916e" id="total" />
            )}
            {totalMultiplier > 0 && (
              <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mt: 0.5 }}>
                {totalMultiplier.toFixed(1)}x your money
              </Typography>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
