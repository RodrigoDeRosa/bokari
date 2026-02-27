import { useMemo } from 'react';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { InvestmentProjectionResult } from '../../types';

interface ProjectionChartProps {
  result: InvestmentProjectionResult;
  currency: string;
  viewMode: 'total' | 'perAsset';
  onViewModeChange: (mode: 'total' | 'perAsset') => void;
  nodeColorMap: Map<string, string>;
}

function formatCurrency(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function ProjectionChart({ result, currency, viewMode, onViewModeChange, nodeColorMap }: ProjectionChartProps) {
  const totalChartData = useMemo(() => {
    return result.totals.map((d) => ({
      label: d.year === 0 ? 'Now' : `Year ${d.year}`,
      contributions: d.cumulativeContributions,
      growth: d.growth,
    }));
  }, [result]);

  const perAssetChartData = useMemo(() => {
    if (result.totals.length === 0 || result.nodes.length === 0) return [];
    return result.totals.map((d, i) => {
      const point: Record<string, string | number> = {
        label: d.year === 0 ? 'Now' : `Year ${d.year}`,
      };
      for (const node of result.nodes) {
        point[node.nodeId] = node.yearlyData[i]?.portfolioValue ?? 0;
      }
      return point;
    });
  }, [result]);

  if (totalChartData.length === 0) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        <ToggleButtonGroup
          size="small"
          value={viewMode}
          exclusive
          onChange={(_e, val) => { if (val) onViewModeChange(val); }}
        >
          <ToggleButton value="total">Total</ToggleButton>
          <ToggleButton value="perAsset">Per Asset</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ width: '100%', height: 320 }}>
        <ResponsiveContainer>
          {viewMode === 'total' ? (
            <AreaChart data={totalChartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
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
          ) : (
            <LineChart data={perAssetChartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
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
                  const node = result.nodes.find((n) => n.nodeId === name);
                  return [formatCurrency(Number(value ?? 0), currency), node?.label ?? name];
                }}
              />
              <Legend
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => {
                  const node = result.nodes.find((n) => n.nodeId === value);
                  return node?.label ?? value;
                }}
              />
              {result.nodes.map((node) => (
                <Line
                  key={node.nodeId}
                  type="monotone"
                  dataKey={node.nodeId}
                  name={node.nodeId}
                  stroke={nodeColorMap.get(node.nodeId) ?? '#888'}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
