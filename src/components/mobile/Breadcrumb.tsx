import MuiBreadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import Box from '@mui/material/Box';
import type { BokariNode } from '../../types';

interface BreadcrumbProps {
  path: string[];
  nodes: BokariNode[];
  onNavigate: (depth: number) => void;
}

export default function Breadcrumb({ path, nodes, onNavigate }: BreadcrumbProps) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  return (
    <Box sx={{ px: 2, py: 1, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
      <MuiBreadcrumbs separator=">" sx={{ fontSize: 14 }}>
        <Link
          component="button"
          underline="hover"
          color={path.length === 0 ? 'text.primary' : 'inherit'}
          onClick={() => onNavigate(0)}
          sx={{ display: 'flex', alignItems: 'center', fontSize: 14 }}
        >
          <HomeIcon sx={{ fontSize: 18, mr: 0.5 }} />
          Budget
        </Link>
        {path.map((id, i) => {
          const node = nodeMap.get(id);
          const label = node?.data.label ?? id;
          const isLast = i === path.length - 1;
          return isLast ? (
            <Typography key={id} variant="body2" color="text.primary" sx={{ fontWeight: 600, fontSize: 14 }}>
              {label}
            </Typography>
          ) : (
            <Link
              key={id}
              component="button"
              underline="hover"
              color="inherit"
              onClick={() => onNavigate(i + 1)}
              sx={{ fontSize: 14 }}
            >
              {label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
}
