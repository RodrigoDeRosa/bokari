import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { ReactFlow, MiniMap } from '@xyflow/react';
import type { ReactFlowInstance } from '@xyflow/react';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

import '@xyflow/react/dist/style.css';
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

  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      reactFlowInstance.fitView();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reactFlowInstance]);

  if (isMobile) return <MobileTreeView />;

  return (
    <Box sx={{ flex: 1, position: 'relative' }} ref={reactFlowWrapper}>
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
    </Box>
  );
}
