import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { ReactFlow, MiniMap } from '@xyflow/react';
import type { ReactFlowInstance } from '@xyflow/react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import DeleteIcon from '@mui/icons-material/Delete';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import '@xyflow/react/dist/style.css';
import { useTranslation } from 'react-i18next';
import FixedNode from './nodes/FixedNode';
import ProportionalNode from './nodes/ProportionalNode';
import RelativeNode from './nodes/RelativeNode';
import RootNode from './nodes/RootNode';
import AggregatorNode from './nodes/AggregatorNode';
import NodeCreator from './NodeCreator';
import createNode from '../utils/createNode';
import getFullPath from '../utils/getFullPath';
import FixedGroupNode from './nodes/fixedGroupNode/FixedGroupNode';
import MobileTreeView from './mobile/MobileTreeView';
import { useBudgetTree } from '../context/BudgetTreeContext';
import { NODE_TYPE_COLORS } from '../constants/nodeColors';

const nodeTypes = {
  fixedNode: FixedNode,
  proportionalNode: ProportionalNode,
  relativeNode: RelativeNode,
  rootNode: RootNode,
  aggregatorNode: AggregatorNode,
  fixedGroupNode: FixedGroupNode,
};

export default function GraphView() {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reactFlowInstance, setLocalReactFlowInstance] = useState<ReactFlowInstance<any, any> | null>(null);

  const {
    nodes,
    edges,
    currency,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeDataChange,
    getInvestmentConflicts,
    setInvestmentError,
    setNodes,
    setEdges,
    takeSnapshot,
    setReactFlowInstance,
  } = useBudgetTree();

  const handleInit = useCallback((instance: ReactFlowInstance<any, any>) => {
    setLocalReactFlowInstance(instance);
    setReactFlowInstance(instance as ReactFlowInstance);
  }, [setReactFlowInstance]);

  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const highlightPath = useMemo(() => {
    if (!hoveredNodeId) return null;
    return getFullPath(hoveredNodeId, edges);
  }, [hoveredNodeId, edges]);

  const styledNodes = useMemo(() => {
    return nodes.map((node) => {
      const dimmed = highlightPath && !highlightPath.nodeIds.has(node.id);
      return {
        ...node,
        data: { ...node.data, handleNodeDataChange, getInvestmentConflicts, setInvestmentError, currency },
        className: dimmed ? 'dimmed' : undefined,
      };
    });
  }, [nodes, highlightPath, handleNodeDataChange, getInvestmentConflicts, setInvestmentError, currency]);

  const styledEdges = useMemo(() => {
    return edges.map((edge) => {
      const onPath = highlightPath?.edgeIds.has(edge.id);
      const dimmed = highlightPath && !onPath;
      return {
        ...edge,
        className: dimmed ? 'dimmed' : onPath ? 'highlighted' : undefined,
      };
    });
  }, [edges, highlightPath]);

  const onNodeMouseEnter = useCallback((_: React.MouseEvent, node: { id: string }) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      takeSnapshot();
      createNode(event, reactFlowInstance as ReactFlowInstance | null, reactFlowWrapper, setNodes);
    },
    [reactFlowInstance, reactFlowWrapper, setNodes, takeSnapshot],
  );

  // Multi-selection: track selected nodes
  const selectedNodes = useMemo(
    () => nodes.filter((n) => n.selected),
    [nodes],
  );

  const deleteSelected = useCallback(() => {
    if (selectedNodes.length === 0) return;
    takeSnapshot();
    const selectedIds = new Set(selectedNodes.map((n) => n.id));
    setNodes((nds) => nds.filter((n) => !selectedIds.has(n.id)));
    setEdges((eds) => eds.filter((e) => !selectedIds.has(e.source) && !selectedIds.has(e.target)));
  }, [selectedNodes, takeSnapshot, setNodes, setEdges]);

  // Delete/Backspace to remove selected nodes
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Delete' && e.key !== 'Backspace') return;
      // Don't intercept when typing in an input
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      e.preventDefault();
      deleteSelected();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected]);

  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      reactFlowInstance.fitView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactFlowInstance]);

  if (isMobile) return <MobileTreeView />;

  return (
    <Box data-tour="canvas" sx={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
      <ReactFlow
        nodes={styledNodes}
        edges={styledEdges}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        onInit={handleInit}
        onNodesChange={onNodesChange as (changes: import('@xyflow/react').NodeChange[]) => void}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        deleteKeyCode={null}
        panOnScroll
      >
        <MiniMap
          nodeColor={(node) => {
            const type = node.type as keyof typeof NODE_TYPE_COLORS;
            return NODE_TYPE_COLORS[type] ?? '#ccc';
          }}
          zoomable
          pannable
        />
      </ReactFlow>
      <NodeCreator />

      {/* Floating selection toolbar */}
      {selectedNodes.length > 0 && (
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 0.75,
            borderRadius: 2,
            zIndex: 10,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {t('graph.selectedCount', { count: selectedNodes.length })}
          </Typography>
          <Button
            size="small"
            color="error"
            variant="outlined"
            startIcon={<DeleteIcon fontSize="small" />}
            onClick={deleteSelected}
          >
            {t('dialogs.delete')}
          </Button>
        </Paper>
      )}
    </Box>
  );
}
