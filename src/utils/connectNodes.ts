import { addEdge, getOutgoers } from '@xyflow/react';
import type { Connection } from '@xyflow/react';
import { v4 as uuid4 } from 'uuid';
import type { BokariNode, BokariEdge } from '../types';

function createRelativeNode(
  source: BokariNode,
  target: BokariNode,
  setNodes: React.Dispatch<React.SetStateAction<BokariNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<BokariEdge[]>>,
) {
  const newNode: BokariNode = {
    id: uuid4(),
    type: 'relativeNode',
    position: { x: source.position.x + 150, y: source.position.y + 150 },
    data: {
      label: `Rest of ${source.data.label}`,
      value: source.data.value - target.data.value,
    },
  };
  setNodes((nds) => nds.concat(newNode));
  setEdges((eds) => addEdge({ source: source.id, target: newNode.id, sourceHandle: null, targetHandle: null }, eds));
}

function createOrUpdateRelativeNode(
  source: BokariNode,
  target: BokariNode,
  nodes: BokariNode[],
  edges: BokariEdge[],
  setNodes: React.Dispatch<React.SetStateAction<BokariNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<BokariEdge[]>>,
) {
  const sourceRelativeChild = (getOutgoers(source, nodes, edges) as BokariNode[]).find(
    (child) => child.type === 'relativeNode',
  );

  if (sourceRelativeChild == null) {
    createRelativeNode(source, target, setNodes, setEdges);
  } else {
    sourceRelativeChild.data = {
      ...sourceRelativeChild.data,
      value: sourceRelativeChild.data.value - target.data.value,
    };
  }
}

export default function connectNodes(
  nodes: BokariNode[],
  edges: BokariEdge[],
  edgeParams: Connection,
  setNodes: React.Dispatch<React.SetStateAction<BokariNode[]>>,
  setEdges: React.Dispatch<React.SetStateAction<BokariEdge[]>>,
) {
  const source = nodes.find((node) => node.id === edgeParams.source);
  const target = nodes.find((node) => node.id === edgeParams.target);

  // Block outgoing connections from asset nodes
  if (source?.type === 'assetNode') return;

  // Injection edge: budget node → asset node
  if (target?.type === 'assetNode') {
    setEdges((eds) => addEdge({ ...edgeParams, data: { isInjection: true } }, eds));
    return;
  }

  setEdges((eds) => addEdge(edgeParams, eds));

  if (!target || target.type === 'aggregatorNode') return;
  if (!source) return;
  createOrUpdateRelativeNode(source, target, nodes, edges, setNodes, setEdges);

  setNodes((nds) => nds.map((node) => ({ ...node })));
}
