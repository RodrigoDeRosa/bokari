import { useState, useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import type { InvestmentProjectionResult } from '../../types';

interface ProjectionTableProps {
  result: InvestmentProjectionResult;
  currency: string;
}

function fmt(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function ProjectionTable({ result, currency }: ProjectionTableProps) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());

  const toggleYear = useCallback((year: number) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      if (next.has(year)) {
        next.delete(year);
      } else {
        next.add(year);
      }
      return next;
    });
  }, []);

  if (result.totals.length === 0) return null;

  const hasMultipleNodes = result.nodes.length > 1;

  return (
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            {hasMultipleNodes && <TableCell sx={{ fontWeight: 'bold', width: 40 }} />}
            <TableCell sx={{ fontWeight: 'bold' }}>Year</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Monthly Contribution</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cumulative Contributions</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Portfolio Value</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Growth</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.totals.map((row) => {
            const isExpanded = expandedYears.has(row.year);
            return [
              <TableRow key={row.year}>
                {hasMultipleNodes && (
                  <TableCell sx={{ p: 0, pl: 0.5 }}>
                    <IconButton size="small" onClick={() => toggleYear(row.year)}>
                      {isExpanded ? <KeyboardArrowUpIcon fontSize="small" /> : <KeyboardArrowDownIcon fontSize="small" />}
                    </IconButton>
                  </TableCell>
                )}
                <TableCell>{row.year === 0 ? 'Now' : `Year ${row.year}`}</TableCell>
                <TableCell align="right">{fmt(row.monthlyContribution, currency)}</TableCell>
                <TableCell align="right">{fmt(row.cumulativeContributions, currency)}</TableCell>
                <TableCell align="right">{fmt(row.portfolioValue, currency)}</TableCell>
                <TableCell align="right" sx={{ color: row.growth > 0 ? '#00916e' : undefined }}>
                  {fmt(row.growth, currency)}
                </TableCell>
              </TableRow>,
              ...(isExpanded && hasMultipleNodes
                ? result.nodes.map((node) => {
                    const yd = node.yearlyData[row.year];
                    if (!yd) return null;
                    return (
                      <TableRow key={`${row.year}-${node.nodeId}`} sx={{ bgcolor: 'action.hover' }}>
                        <TableCell />
                        <TableCell sx={{ color: 'text.secondary', pl: 4 }}>{node.label}</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>{fmt(yd.monthlyContribution, currency)}</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>{fmt(yd.cumulativeContributions, currency)}</TableCell>
                        <TableCell align="right" sx={{ color: 'text.secondary' }}>{fmt(yd.portfolioValue, currency)}</TableCell>
                        <TableCell align="right" sx={{ color: yd.growth > 0 ? '#00916e' : 'text.secondary' }}>
                          {fmt(yd.growth, currency)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                : []),
            ];
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
