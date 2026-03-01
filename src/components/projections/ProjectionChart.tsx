import { useMemo } from 'react';
import Box from '@mui/material/Box';
import {
  AreaChart, Area, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import type { InvestmentProjectionResult } from '../../types';

interface ProjectionChartProps {
  result: InvestmentProjectionResult;
  baseResult?: InvestmentProjectionResult | null;
  currency: string;
  viewMode: 'total' | 'perAsset';
  nodeColorMap: Map<string, string>;
  height?: number;
}

function formatCurrency(value: number, currency: string): string {
  if (value >= 1_000_000) {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 1, notation: 'compact' }).format(value);
  }
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

/* ---------- Custom tooltip ---------- */

const LABEL_MAP: Record<string, string> = {
  contributions: 'Contributions',
  growth: 'Growth',
  baseTotal: 'Current plan',
};

interface TooltipEntry {
  dataKey: string;
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  label?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: any[];
  currency: string;
  nodeMap?: Map<string, string>;
}

function CustomTooltip({ active, label, payload, currency, nodeMap }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        minWidth: 180,
      }}
    >
      <div style={{ fontWeight: 700, color: '#fff', fontSize: 13, marginBottom: 8 }}>
        {label}
      </div>
      {(payload as TooltipEntry[]).map((entry) => {
        const displayName =
          LABEL_MAP[entry.dataKey] ??
          (nodeMap ? (nodeMap.get(entry.dataKey) ?? entry.name) : entry.name);
        return (
          <div
            key={entry.dataKey}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              padding: '3px 0',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: entry.color,
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                {displayName}
              </span>
            </span>
            <span style={{ fontWeight: 700, color: '#fff', fontSize: 12 }}>
              {formatCurrency(Number(entry.value ?? 0), currency)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Crosshair cursor ---------- */

const crosshairStyle = { stroke: 'rgba(150,150,150,0.5)', strokeDasharray: '4 3', strokeWidth: 1 };

/* ---------- Main component ---------- */

export default function ProjectionChart({ result, baseResult, currency, viewMode, nodeColorMap, height = 320 }: ProjectionChartProps) {
  const totalChartData = useMemo(() => {
    return result.totals.map((d, i) => {
      const point: Record<string, string | number> = {
        label: d.year === 0 ? 'Now' : `Year ${d.year}`,
        contributions: d.cumulativeContributions,
        growth: d.growth,
      };
      if (baseResult && baseResult.totals[i]) {
        point.baseTotal = baseResult.totals[i].portfolioValue;
      }
      return point;
    });
  }, [result, baseResult]);

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

  // Build a nodeId → label map for per-asset tooltip
  const nodeLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const node of result.nodes) {
      map.set(node.nodeId, node.label);
    }
    return map;
  }, [result.nodes]);

  const hasBase = !!baseResult && viewMode === 'total';

  if (totalChartData.length === 0) return null;

  return (
    <Box sx={{ width: '100%', height }}>
      <ResponsiveContainer>
        {viewMode === 'total' ? (
          <AreaChart data={totalChartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="contribGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00916e" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#00916e" stopOpacity={0.15} />
              </linearGradient>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff006e" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#ff006e" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => formatCurrency(v as number, currency)}
              width={80}
            />
            <Tooltip
              content={<CustomTooltip currency={currency} />}
              cursor={crosshairStyle}
            />
            <Legend
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any) => value === 'baseTotal' ? 'Current plan' : value}
            />
            <Area
              type="monotone"
              dataKey="contributions"
              name="Contributions"
              stackId="portfolio"
              stroke="#00916e"
              fill="url(#contribGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="growth"
              name="Growth"
              stackId="portfolio"
              stroke="#ff006e"
              fill="url(#growthGradient)"
              strokeWidth={2}
            />
            {hasBase && (
              <Line
                type="monotone"
                dataKey="baseTotal"
                name="baseTotal"
                stroke="#999"
                strokeWidth={1.5}
                strokeDasharray="6 4"
                dot={false}
                opacity={0.5}
              />
            )}
          </AreaChart>
        ) : (
          <LineChart data={perAssetChartData} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            {/* Per-asset gradient definitions */}
            <defs>
              {result.nodes.map((node) => {
                const color = nodeColorMap.get(node.nodeId) ?? '#888';
                return (
                  <linearGradient key={node.nodeId} id={`assetGrad_${node.nodeId}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0.03} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => formatCurrency(v as number, currency)}
              width={80}
            />
            <Tooltip
              content={<CustomTooltip currency={currency} nodeMap={nodeLabelMap} />}
              cursor={crosshairStyle}
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
  );
}
