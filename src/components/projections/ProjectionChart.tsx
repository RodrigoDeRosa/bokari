import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { InvestmentProjectionResult } from '../../types';

interface ProjectionChartProps {
  result: InvestmentProjectionResult;
  currency: string;
}

function formatCurrency(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function ProjectionChart({ result, currency }: ProjectionChartProps) {
  const chartData = useMemo(() => {
    return result.totals.map((d) => ({
      label: d.year === 0 ? 'Now' : `Year ${d.year}`,
      contributions: d.cumulativeContributions,
      growth: d.growth,
    }));
  }, [result]);

  if (chartData.length === 0) return null;

  return (
    <Box sx={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <AreaChart data={chartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => formatCurrency(v as number, currency)}
            width={80}
          />
          <Tooltip
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={(value: any, name: any) => [
              formatCurrency(Number(value ?? 0), currency),
              name === 'contributions' ? 'Contributions' : 'Growth',
            ]}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="contributions"
            name="Contributions"
            stackId="portfolio"
            stroke="#00916e"
            fill="#00916e"
            fillOpacity={0.4}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="growth"
            name="Growth"
            stackId="portfolio"
            stroke="#ff006e"
            fill="#ff006e"
            fillOpacity={0.3}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
