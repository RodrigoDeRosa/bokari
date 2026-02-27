import { useCallback, useState, useEffect, useRef } from 'react';
import { ReactFlow, ReactFlowProvider } from '@xyflow/react';
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
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
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
  } = useBudgetTree();

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
      createNode(event, reactFlowInstance, reactFlowWrapper, setNodes);
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
          nodes={nodes.map((node) => ({
            ...node,
            data: {
              ...node.data,
              handleNodeDataChange,
              currency,
            },
          }))}
          edges={edges}
          nodeTypes={nodeTypes}
          onInit={setReactFlowInstance}
          onNodesChange={onNodesChange as (changes: import('@xyflow/react').NodeChange[]) => void}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          panOnScroll
        />
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
