import type { BokariNode, BokariEdge } from '../types';

const EXPORT_VERSION = 1;

export interface ExportData {
  version: number;
  currency: string;
  nodes: ExportNode[];
  edges: ExportEdge[];
  exportedAt: string;
}

interface ExportNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    value: number;
    proportion?: number;
    children?: { id: string; label: string; value: number }[];
  };
}

interface ExportEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export function exportToJSON(nodes: BokariNode[], edges: BokariEdge[], currency: string): string {
  const exportData: ExportData = {
    version: EXPORT_VERSION,
    currency,
    exportedAt: new Date().toISOString(),
    nodes: nodes.map((node) => ({
      id: node.id,
      type: node.type ?? 'fixedNode',
      position: node.position,
      data: {
        label: node.data.label,
        value: node.data.value,
        ...(node.data.proportion !== undefined && { proportion: node.data.proportion }),
        ...(node.data.children && { children: node.data.children }),
      },
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      ...(edge.sourceHandle && { sourceHandle: edge.sourceHandle }),
      ...(edge.targetHandle && { targetHandle: edge.targetHandle }),
    })),
  };

  return JSON.stringify(exportData, null, 2);
}

export function downloadJSON(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateImport(data: unknown): data is ExportData {
  if (typeof data !== 'object' || data === null) return false;
  const d = data as Record<string, unknown>;

  if (typeof d.version !== 'number') return false;
  if (!Array.isArray(d.nodes)) return false;
  if (!Array.isArray(d.edges)) return false;

  for (const node of d.nodes) {
    if (typeof node !== 'object' || node === null) return false;
    const n = node as Record<string, unknown>;
    if (typeof n.id !== 'string') return false;
    if (typeof n.type !== 'string') return false;
    if (typeof n.position !== 'object' || n.position === null) return false;
    if (typeof n.data !== 'object' || n.data === null) return false;
  }

  for (const edge of d.edges) {
    if (typeof edge !== 'object' || edge === null) return false;
    const e = edge as Record<string, unknown>;
    if (typeof e.source !== 'string') return false;
    if (typeof e.target !== 'string') return false;
  }

  return true;
}

export function importFromJSON(json: string): { nodes: BokariNode[]; edges: BokariEdge[]; currency: string } {
  const data = JSON.parse(json);

  if (!validateImport(data)) {
    throw new Error('Invalid Bokari export file');
  }

  return {
    currency: data.currency ?? 'EUR',
    nodes: data.nodes.map((node) => ({
      id: node.id,
      type: node.type,
      position: node.position,
      data: {
        label: node.data.label,
        value: node.data.value,
        proportion: node.data.proportion,
        children: node.data.children,
      },
    })),
    edges: data.edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    })),
  };
}
