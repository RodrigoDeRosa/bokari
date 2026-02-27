import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { ReactFlow, ReactFlowProvider, MiniMap } from '@xyflow/react';
import type { ReactFlowInstance } from '@xyflow/react';
import Box from '@mui/material/Box';

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
import Instructions from './Instructions';
import Toolbar from './Toolbar';
import { BudgetTreeProvider, useBudgetTree } from '../context/BudgetTreeContext';

const nodeTypes = {
  fixedNode: FixedNode,
  proportionalNode: ProportionalNode,
  relativeNode: RelativeNode,
  rootNode: RootNode,
  aggregatorNode: AggregatorNode,
  fixedGroupNode: FixedGroupNode,
};

function GraphInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [reactFlowInstance, setLocalReactFlowInstance] = useState<ReactFlowInstance<any, any> | null>(null);
  const [helpOpen, setHelpOpen] = useState(() => {
    return !localStorage.getItem('bokari-help-dismissed');
  });

  const {
    nodes,
    edges,
    currency,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeDataChange,
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
        data: { ...node.data, handleNodeDataChange, currency },
        className: dimmed ? 'dimmed' : undefined,
      };
    });
  }, [nodes, highlightPath, handleNodeDataChange, currency]);

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

  const handleToggleHelp = () => {
    setHelpOpen((prev) => {
      if (!prev === false) {
        localStorage.setItem('bokari-help-dismissed', 'true');
      }
      return !prev;
    });
  };

  const handleCloseHelp = () => {
    setHelpOpen(false);
    localStorage.setItem('bokari-help-dismissed', 'true');
  };

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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
      <Toolbar onToggleHelp={handleToggleHelp} />
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
              switch (node.type) {
                case 'rootNode': return '#ffbe0b';
                case 'fixedNode': return '#fb5607';
                case 'proportionalNode': return '#ff006e';
                case 'relativeNode': return '#8338ec';
                case 'aggregatorNode': return '#3a86ff';
                case 'fixedGroupNode': return '#00916e';
                default: return '#ccc';
              }
            }}
            zoomable
            pannable
          />
        </ReactFlow>
        <NodeCreator />
      </Box>
      <Instructions open={helpOpen} onClose={handleCloseHelp} />
    </Box>
  );
}

function Graph() {
  return (
    <ReactFlowProvider>
      <BudgetTreeProvider>
        <GraphInner />
      </BudgetTreeProvider>
    </ReactFlowProvider>
  );
}

export default Graph;
