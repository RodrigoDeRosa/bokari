import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { InvestmentProjectionResult } from '../../types';

interface ProjectionTableProps {
  result: InvestmentProjectionResult;
  currency: string;
}

function fmt(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function ProjectionTable({ result, currency }: ProjectionTableProps) {
  if (result.totals.length === 0) return null;

  return (
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Year</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Monthly Contribution</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Cumulative Contributions</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Portfolio Value</TableCell>
            <TableCell align="right" sx={{ fontWeight: 'bold' }}>Growth</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {result.totals.map((row) => (
            <TableRow key={row.year}>
              <TableCell>{row.year === 0 ? 'Now' : `Year ${row.year}`}</TableCell>
              <TableCell align="right">{fmt(row.monthlyContribution, currency)}</TableCell>
              <TableCell align="right">{fmt(row.cumulativeContributions, currency)}</TableCell>
              <TableCell align="right">{fmt(row.portfolioValue, currency)}</TableCell>
              <TableCell align="right" sx={{ color: row.growth > 0 ? '#00916e' : undefined }}>
                {fmt(row.growth, currency)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
