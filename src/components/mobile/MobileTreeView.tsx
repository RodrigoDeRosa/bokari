import { useState, useMemo, useCallback } from 'react';
import { v4 as uuid4 } from 'uuid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';
import { useBudgetTree } from '../../context/BudgetTreeContext';
import Breadcrumb from './Breadcrumb';
import BudgetNodeCard from './BudgetNodeCard';
import NodeEditDialog from './NodeEditDialog';
import NodeCreationMenu from './NodeCreationMenu';
import type { BokariNode, NodeType } from '../../types';

const MOBILE_TIP_DISMISSED_KEY = 'bokari-mobile-tip-dismissed';

export default function MobileTreeView() {
  const { t } = useTranslation();
  const { nodes, edges, currency, handleNodeDataChange, setNodes, setEdges, takeSnapshot } = useBudgetTree();
  const [path, setPath] = useState<string[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(
    () => localStorage.getItem(MOBILE_TIP_DISMISSED_KEY) === 'true',
  );

  // Build children map: parentId -> childIds[]
  const childrenMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const edge of edges) {
      const children = map.get(edge.source);
      if (children) {
        children.push(edge.target);
      } else {
        map.set(edge.source, [edge.target]);
      }
    }
    return map;
  }, [edges]);

  // Root nodes = nodes with in-degree 0 (no edges targeting them)
  const rootNodeIds = useMemo(() => {
    const targeted = new Set(edges.map((e) => e.target));
    return nodes.filter((n) => !targeted.has(n.id)).map((n) => n.id);
  }, [nodes, edges]);

  const nodeMap = useMemo(() => new Map(nodes.map((n) => [n.id, n])), [nodes]);

  // Current level: if path is empty show roots, otherwise show children of last path node
  const currentNodeIds = useMemo(() => {
    if (path.length === 0) return rootNodeIds;
    const parentId = path[path.length - 1];
    return childrenMap.get(parentId) ?? [];
  }, [path, rootNodeIds, childrenMap]);

  const currentParentId = path.length > 0 ? path[path.length - 1] : null;

  const handleDrillDown = useCallback((id: string) => {
    setPath((prev) => [...prev, id]);
  }, []);

  const handleNavigate = useCallback((depth: number) => {
    setPath((prev) => prev.slice(0, depth));
  }, []);

  const handleEdit = useCallback((id: string) => {
    setEditingNodeId(id);
  }, []);

  const handleSaveNode = useCallback((nodeId: string, updates: Record<string, unknown>) => {
    takeSnapshot();
    handleNodeDataChange(nodeId, updates);
  }, [takeSnapshot, handleNodeDataChange]);

  const handleDeleteNode = useCallback((nodeId: string) => {
    takeSnapshot();
    // Remove the node and all edges connected to it
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    // If the deleted node is in the drill-down path, navigate up
    setPath((prev) => {
      const idx = prev.indexOf(nodeId);
      return idx >= 0 ? prev.slice(0, idx) : prev;
    });
  }, [takeSnapshot, setNodes, setEdges]);

  const handleParentChange = useCallback((nodeId: string, newParentId: string | null) => {
    // No takeSnapshot here — the caller (NodeEditDialog handleSave) already
    // triggers handleSaveNode which snapshots before this runs.
    setEdges((eds) => {
      // Remove existing incoming edges for this node
      const filtered = eds.filter((e) => e.target !== nodeId);
      // Add new edge if a parent was selected
      if (newParentId) {
        return [...filtered, { id: `e-${newParentId}-${nodeId}`, source: newParentId, target: nodeId }];
      }
      return filtered;
    });
  }, [setEdges]);

  const dismissTip = useCallback(() => {
    setTipDismissed(true);
    localStorage.setItem(MOBILE_TIP_DISMISSED_KEY, 'true');
  }, []);

  const handleCreateNode = useCallback((type: NodeType) => {
    takeSnapshot();
    const newNode: BokariNode = {
      id: uuid4(),
      type,
      position: { x: 0, y: 0 },
      data: { label: t('mobile.newNode'), value: 0, proportion: 0, children: [] },
    };

    // If drilled into a parent, connect the new node as its child
    if (currentParentId) {
      const isFirstChild = !childrenMap.has(currentParentId);
      // Auto-create a "Remainder" node alongside the first child
      const remainderNode: BokariNode | null =
        isFirstChild && type !== 'relativeNode'
          ? {
              id: uuid4(),
              type: 'relativeNode',
              position: { x: 0, y: 0 },
              data: { label: t('mobile.remainder'), value: 0, proportion: 0, children: [] },
            }
          : null;

      setNodes((nds) => remainderNode ? [...nds, newNode, remainderNode] : [...nds, newNode]);
      setEdges((eds) => {
        const updated = [...eds, {
          id: `e-${currentParentId}-${newNode.id}`,
          source: currentParentId,
          target: newNode.id,
        }];
        if (remainderNode) {
          updated.push({
            id: `e-${currentParentId}-${remainderNode.id}`,
            source: currentParentId,
            target: remainderNode.id,
          });
        }
        return updated;
      });
    } else {
      setNodes((nds) => [...nds, newNode]);
    }

    // Open edit dialog immediately for the new node
    setEditingNodeId(newNode.id);
  }, [takeSnapshot, setNodes, setEdges, currentParentId, childrenMap]);

  const editingNode = editingNodeId ? nodeMap.get(editingNodeId) ?? null : null;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Breadcrumb path={path} nodes={nodes} onNavigate={handleNavigate} />

      {!tipDismissed && (
        <Alert severity="info" variant="outlined" onClose={dismissTip} sx={{ mx: 1.5, mt: 1 }}>
          {t('mobile.desktopTip')}
        </Alert>
      )}

      <Box data-tour="mobile-cards" sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {currentNodeIds.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              {t('mobile.noSubItems')}
            </Typography>
          </Box>
        ) : (
          currentNodeIds.map((id) => {
            const node = nodeMap.get(id);
            if (!node) return null;
            const childCount = childrenMap.get(id)?.length ?? 0;
            return (
              <BudgetNodeCard
                key={id}
                node={node}
                childCount={childCount}
                onDrillDown={handleDrillDown}
                onEdit={handleEdit}
                currency={currency}
              />
            );
          })
        )}
      </Box>

      {/* FAB for creating new nodes */}
      <Fab
        data-tour="mobile-fab"
        color="primary"
        size="medium"
        onClick={() => setCreateMenuOpen(true)}
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        aria-label={t('mobile.addNode')}
      >
        <AddIcon />
      </Fab>

      {/* Edit dialog */}
      <NodeEditDialog
        node={editingNode}
        open={editingNodeId !== null}
        onClose={() => setEditingNodeId(null)}
        onSave={handleSaveNode}
        onDelete={handleDeleteNode}
        onParentChange={handleParentChange}
        currency={currency}
        nodes={nodes}
        edges={edges}
      />

      {/* Node creation menu */}
      <NodeCreationMenu
        open={createMenuOpen}
        onClose={() => setCreateMenuOpen(false)}
        onCreate={handleCreateNode}
        hasParent={currentParentId !== null}
      />
    </Box>
  );
}
