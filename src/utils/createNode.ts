import { v4 as uuid4 } from 'uuid';
import type { ReactFlowInstance } from '@xyflow/react';
import type { BokariNode } from '../types';

export default function createNode(
  dropEvent: React.DragEvent,
  reactFlowInstance: ReactFlowInstance | null,
  reactFlowWrapper: React.RefObject<HTMLDivElement | null>,
  setNodes: React.Dispatch<React.SetStateAction<BokariNode[]>>,
) {
  dropEvent.preventDefault();

  if (!reactFlowInstance || !reactFlowWrapper.current) return;

  const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
  const type = dropEvent.dataTransfer.getData('application/reactflow');

  if (typeof type === 'undefined' || !type) return;

  const position = reactFlowInstance.screenToFlowPosition({
    x: dropEvent.clientX - reactFlowBounds.left,
    y: dropEvent.clientY - reactFlowBounds.top,
  });

  const newNode: BokariNode = {
    id: uuid4(),
    type,
    position,
    data: { label: 'Node Name', value: 0, proportion: 0, children: [] },
    selected: true,
  };

  setNodes((nodes) => {
    const deselected = nodes.map((node) => ({ ...node, selected: false }));
    return [...deselected, newNode];
  });
}
