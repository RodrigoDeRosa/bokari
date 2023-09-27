import { v4 as uuid4 } from "uuid";

export default function createNode(
  dropEvent,
  reactFlowInstance,
  reactFlowWrapper,
  setNodes
) {
  dropEvent.preventDefault();

  const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
  const type = dropEvent.dataTransfer.getData("application/reactflow");

  if (typeof type === "undefined" || !type) {
    return;
  }

  const position = reactFlowInstance.project({
    x: dropEvent.clientX - reactFlowBounds.left,
    y: dropEvent.clientY - reactFlowBounds.top,
  });
  const newNode = {
    id: uuid4(),
    type,
    position,
    data: { label: `${type}`, value: 0, proportion: 0 },
  };

  setNodes((nd) => nd.concat(newNode));
}
