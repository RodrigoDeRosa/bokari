import { useMemo } from 'react';
import Box from '@mui/material/Box';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { ProjectionDataPoint } from '../../types';

interface Series {
  id: string;
  label: string;
  color: string;
}

interface ProjectionChartProps {
  data: ProjectionDataPoint[];
  series: Series[];
  currency: string;
}

function formatCurrency(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function ProjectionChart({ data, series, currency }: ProjectionChartProps) {
  const chartData = useMemo(() => {
    return data.map((point) => ({
      label: point.label,
      ...point.values,
    }));
  }, [data]);

  if (series.length === 0 || data.length === 0) return null;

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
            formatter={(value: any, name: any) => {
              const s = series.find((s) => s.id === name);
              return [formatCurrency(Number(value ?? 0), currency), s?.label ?? name];
            }}
          />
          {series.length > 1 && <Legend />}
          {series.map((s) => (
            <Area
              key={s.id}
              type="monotone"
              dataKey={s.id}
              name={s.id}
              stroke={s.color}
              fill={s.color}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}
