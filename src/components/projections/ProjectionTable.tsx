import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import type { ProjectionDataPoint } from '../../types';

interface Column {
  id: string;
  label: string;
}

interface ProjectionTableProps {
  data: ProjectionDataPoint[];
  columns: Column[];
  currency: string;
}

function formatCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);
}

export default function ProjectionTable({ data, columns, currency }: ProjectionTableProps) {
  if (columns.length === 0 || data.length === 0) return null;

  return (
    <TableContainer sx={{ maxHeight: 400 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Year</TableCell>
            {columns.map((col) => (
              <TableCell key={col.id} align="right" sx={{ fontWeight: 'bold' }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.year}>
              <TableCell>{row.label}</TableCell>
              {columns.map((col) => (
                <TableCell key={col.id} align="right">
                  {formatCurrency(row.values[col.id] ?? 0, currency)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
