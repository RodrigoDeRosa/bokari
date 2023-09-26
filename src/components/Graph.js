import { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  getIncomers,
  getOutgoers,
} from "reactflow";
import {v4 as uuid4} from 'uuid';

import "reactflow/dist/style.css";
import FixedNode from "./FixedNode";
import ProportionalNode from "./ProportionalNode";
import RelativeNode from "./RelativeNode";
import RootNode from "./RootNode";
import LeafNode from "./LeafNode";
import Sidebar from "./Sidebar";

const nodeTypes = {
  fixedNode: FixedNode,
  proportionalNode: ProportionalNode,
  relativeNode: RelativeNode,
  rootNode: RootNode,
  leafNode: LeafNode,
};

function useLocalStorage(key, initialValue) {
  return localStorage.getItem(key)
    ? JSON.parse(localStorage.getItem(key))
    : initialValue;
}

const initialNodes = [
  {
    id: "0",
    type: "rootNode",
    position: { x: 600, y: 100 },
    data: { label: "Balance", value: 100, proportion: 0 },
  }
];
const initialEdges = [];

function processTree(nodes, edges, setNodes, setEdges) {
  let rootNodes = nodes.filter((node) => node.type === "rootNode");
  
  // `getConnectedEdges` gives us all the edges connected to a node, either as source or target.
  // `getIncomers` and `getOutgoers` give us the nodes connected to a node as source or target.
  rootNodes.forEach((rootNode) => {
    let neighbors = [rootNode];

    while (neighbors.length > 0) {
      let currentNode = neighbors.pop();

      let children = getOutgoers(currentNode, nodes, edges);
      if (children.length === 0) {
        continue;
      }

      // Recalculate the value of each proportional node in case the parent's value changed
      children
        .filter((child) => child.type == 'proportionalNode')
        .forEach((child) => {
          child.data = {
            ...child.data,
            value: (child.data.proportion / 100) * currentNode.data.value,
          };
        });

      // If a node has 1 child, then it also has a relative child
      // and we want to recalculate its value
      let usedTotal = children
        .filter((child) => child.type !== "relativeNode")
        .reduce((acc, child) => acc + child.data.value, 0);
      children
        .filter((child) => child.type === "relativeNode")
        .map((child) => {
          child.data = {
            ...child.data,
            value: currentNode.data.value - usedTotal,
          };
      });

      neighbors.push(...children);
    }
  });

  let leafNodes = nodes.filter((node) => node.type === "leafNode");
  leafNodes.forEach((leafNode) => {
    let parents = getIncomers(leafNode, nodes, edges);
    let totalValue = parents.reduce((acc, parent) => acc + parent.data.value, 0);
    leafNode.data = {
      ...leafNode.data,
      value: totalValue,
    };
  });

  setNodes((nds) => nds.map(node => node));
  setEdges((eds) => eds.map(edge => edge));
}

function Graph() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(useLocalStorage("nodes", initialNodes));
  const [edges, setEdges, onEdgesChange] = useEdgesState(useLocalStorage("edges", initialEdges));
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onConnect = useCallback(
    (params) => {
      let parent = nodes.filter((node) => node.id === params.source)[0];
      let newChild = nodes.filter((node) => node.id === params.target)[0];
      setEdges((eds) => addEdge(params, eds));

      if (newChild.type === "leafNode") {
        newChild.data = {
          ...newChild.data,
          value: newChild.data.value + parent.data.value,
        };
        processTree(nodes, edges, setNodes, setEdges);
        return;
      }

      if (newChild.type === "proportionalNode") {
        newChild.data = {
          ...newChild.data,
          value: (newChild.data.proportion / 100) * parent.data.value,
        };
      }

      let children = getOutgoers(parent, nodes, edges)

      let relativeChild = children.filter((child) => child.type === "relativeNode")[0];
      if (relativeChild == null) {
        let newNode = {
          id: uuid4(),
          type: "relativeNode",
          position: { x: parent.position.x + 150, y: parent.position.y + 150 },
          data: {
            label: `Rest of ${parent.data.label}`,
            value: parent.data.value - newChild.data.value,
          },
        };
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          addEdge({ source: parent.id, target: newNode.id }, eds)
        );
      } else {
        relativeChild.data = {
          ...relativeChild.data,
          value: relativeChild.data.value - newChild.data.value,
        };
      }

      processTree(nodes, edges, setNodes, setEdges);
    },
    [setEdges, nodes, setNodes]
  );

  const [nodeName, setNodeName] = useState("");
  const [nodeValue, setNodeValue] = useState("");
  const [nodeProportion, setNodeProportion] = useState("");

  const selectedNode = nodes.find((node) => node.selected);

  useEffect(() => {
    if (selectedNode != null) {
      selectedNode.data = { ...selectedNode.data, label: nodeName };
    }
    setNodes((nds) => nds.map((node) => node));
  }, [nodeName, setNodes]);

  useEffect(() => {
    if (selectedNode != null) {
      selectedNode.data = {
        ...selectedNode.data,
        value: parseFloat(nodeValue),
      };
    }
    processTree(nodes, edges, setNodes, setEdges);
  }, [nodeValue, setNodes]);

  useEffect(() => {
    if (selectedNode != null) {
      selectedNode.data = {
        ...selectedNode.data,
        proportion: parseFloat(nodeProportion),
      };
    }
    processTree(nodes, edges, setNodes, setEdges);
  }, [nodeProportion, setNodeProportion]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");

      if (typeof type === "undefined" || !type) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      const newNode = {
        id: uuid4(),
        type,
        position,
        data: { label: `${type}`, value: 0, proportion: 0 },
      };

      setNodes((nd) => nd.concat(newNode));
      processTree(nodes, edges, setNodes, setEdges);
    },
    [reactFlowInstance, setNodes]
  );

  localStorage.setItem("nodes", JSON.stringify(nodes));
  localStorage.setItem("edges", JSON.stringify(edges));
  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onInit={setReactFlowInstance}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <div className="updatenode__controls">
              <label>Label:</label>
              <input
                value={selectedNode?.data.label}
                onChange={(evt) => setNodeName(evt.target.value)}
              />

              <label className="updatenode__bglabel">Value:</label>
              <input
                type="number"
                disabled={
                  selectedNode?.type !== "fixedNode" &&
                  selectedNode?.type !== "rootNode"
                }
                value={selectedNode?.data.value}
                onChange={(evt) => setNodeValue(evt.target.value)}
              />

              <label className="updatenode__bglabel">Proportion:</label>
              <input
                type="number"
                disabled={selectedNode?.type !== "proportionalNode"}
                value={selectedNode?.data.proportion}
                onChange={(evt) => setNodeProportion(evt.target.value)}
              />
            </div>
          </ReactFlow>
        </div>
        <Sidebar />
      </ReactFlowProvider>
    </div>
  );
}

export default Graph;
