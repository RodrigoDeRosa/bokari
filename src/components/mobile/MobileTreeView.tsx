import { useState, useMemo, useCallback } from 'react';
import { v4 as uuid4 } from 'uuid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { useBudgetTree } from '../../context/BudgetTreeContext';
import Breadcrumb from './Breadcrumb';
import BudgetNodeCard from './BudgetNodeCard';
import NodeEditDialog from './NodeEditDialog';
import NodeCreationMenu from './NodeCreationMenu';
import type { BokariNode, NodeType } from '../../types';

export default function MobileTreeView() {
  const { nodes, edges, currency, handleNodeDataChange, setNodes, setEdges, takeSnapshot } = useBudgetTree();
  const [path, setPath] = useState<string[]>([]);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);
  const [createMenuOpen, setCreateMenuOpen] = useState(false);

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

  const handleCreateNode = useCallback((type: NodeType) => {
    takeSnapshot();
    const newNode: BokariNode = {
      id: uuid4(),
      type,
      position: { x: 0, y: 0 },
      data: { label: 'New Node', value: 0, proportion: 0, children: [] },
    };
    setNodes((nds) => [...nds, newNode]);

    // If drilled into a parent, connect the new node as its child
    if (currentParentId) {
      setEdges((eds) => [...eds, {
        id: `e-${currentParentId}-${newNode.id}`,
        source: currentParentId,
        target: newNode.id,
      }]);
    }

    // Open edit dialog immediately for the new node
    setEditingNodeId(newNode.id);
  }, [takeSnapshot, setNodes, setEdges, currentParentId]);

  const editingNode = editingNodeId ? nodeMap.get(editingNodeId) ?? null : null;

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Breadcrumb path={path} nodes={nodes} onNavigate={handleNavigate} />

      <Box sx={{ flex: 1, overflow: 'auto', p: 1.5 }}>
        {currentNodeIds.length === 0 ? (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 6 }}>
            <Typography variant="body2" color="text.secondary">
              No sub-items
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
        color="primary"
        size="medium"
        onClick={() => setCreateMenuOpen(true)}
        sx={{ position: 'absolute', bottom: 16, right: 16 }}
        aria-label="Add node"
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
        currency={currency}
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
