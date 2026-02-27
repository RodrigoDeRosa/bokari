import type { BokariNode, BokariEdge } from '../types';
import { v4 as uuid4 } from 'uuid';

const STORAGE_KEY = 'bokari-state';
const CURRENT_VERSION = 2;

export interface PersistedState {
  version: number;
  currency: string;
  nodes: BokariNode[];
  edges: BokariEdge[];
}

function migrateNodes(nodes: BokariNode[]): BokariNode[] {
  return nodes.map((node) => {
    const type = node.type === 'leafNode' ? 'aggregatorNode' : node.type;
    const data = { ...node.data };

    if (type === 'fixedGroupNode') {
      data.children = (data.children ?? []).map((child) => ({
        ...child,
        id: child.id || uuid4(),
      }));
    }

    return { ...node, type, data };
  });
}

function migrateFromLegacy(): PersistedState | null {
  const nodesRaw = localStorage.getItem('nodes');
  const edgesRaw = localStorage.getItem('edges');

  if (!nodesRaw) return null;

  try {
    const nodes = migrateNodes(JSON.parse(nodesRaw));
    const edges = edgesRaw ? JSON.parse(edgesRaw) : [];

    // Clean up legacy keys
    localStorage.removeItem('nodes');
    localStorage.removeItem('edges');

    return {
      version: CURRENT_VERSION,
      currency: 'EUR',
      nodes,
      edges,
    };
  } catch {
    return null;
  }
}

export function loadState(fallbackNodes: BokariNode[], fallbackEdges: BokariEdge[]): PersistedState {
  // Try new format first
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as PersistedState;
      return {
        ...parsed,
        nodes: migrateNodes(parsed.nodes),
      };
    } catch {
      // Fall through
    }
  }

  // Try legacy format
  const legacy = migrateFromLegacy();
  if (legacy) {
    saveState(legacy);
    return legacy;
  }

  // Fresh start
  return {
    version: CURRENT_VERSION,
    currency: 'EUR',
    nodes: fallbackNodes,
    edges: fallbackEdges,
  };
}

export function saveState(state: PersistedState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    version: CURRENT_VERSION,
    currency: state.currency,
    nodes: state.nodes,
    edges: state.edges,
  }));
}

export function clearState(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem('nodes');
  localStorage.removeItem('edges');
}
