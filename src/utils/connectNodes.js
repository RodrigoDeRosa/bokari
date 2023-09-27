import { addEdge, getOutgoers } from "reactflow";
import { v4 as uuid4 } from "uuid";

function createRelativeNode(source, target, setNodes, setEdges) {
  let newNode = {
    id: uuid4(),
    type: "relativeNode",
    position: { x: source.position.x + 150, y: source.position.y + 150 },
    data: {
      label: `Rest of ${source.data.label}`,
      value: source.data.value - target.data.value,
    },
  };
  setNodes((nds) => nds.concat(newNode));
  setEdges((eds) => addEdge({ source: source.id, target: newNode.id }, eds));
}

function createOrUpdateRelativeNode(source, target, nodes, edges, setNodes, setEdges) {
  let sourceRelativeChild = getOutgoers(source, nodes, edges).filter(
    (child) => child.type === "relativeNode"
  )[0];

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
  nodes,
  edges,
  edgeParams,
  setNodes,
  setEdges
) {
  setEdges((eds) => addEdge(edgeParams, eds));

  let target = nodes.filter((node) => node.id === edgeParams.target)[0];
  if (target.type === "leafNode") return;

  let source = nodes.filter((node) => node.id === edgeParams.source)[0];
  createOrUpdateRelativeNode(source, target, nodes, edges, setNodes, setEdges);

  setNodes((nds) => nds.map((node) => node));
}
