import { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
} from "reactflow";

import "reactflow/dist/style.css";
import FixedNode from "./FixedNode";
import ProportionalNode from "./ProportionalNode";
import RelativeNode from "./RelativeNode";
import RootNode from "./RootNode";
import LeafNode from "./LeafNode";
import Sidebar from "./Sidebar";
import updateTree from "../utils/updateTree";
import connectNodes from "../utils/connectNodes";
import { initialNodes, initialEdges } from "../data/exampleData";
import updateSelectedNode from "../utils/updateNode";
import createNode from "../utils/createNode";

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

function Graph() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(
    useLocalStorage("nodes", initialNodes)
  );
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    useLocalStorage("edges", initialEdges)
  );
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const [nodeName, setNodeName] = useState("");
  const [nodeValue, setNodeValue] = useState("");
  const [nodeProportion, setNodeProportion] = useState("");

  useEffect(() => {
    updateSelectedNode(nodes, "label", nodeName, setNodes);
  }, [nodeName]);

  useEffect(() => {
    updateSelectedNode(nodes, "value", parseFloat(nodeValue), setNodes);
  }, [nodeValue]);

  useEffect(() => {
    updateSelectedNode(
      nodes,
      "proportion",
      parseFloat(nodeProportion),
      setNodes
    );
  }, [nodeProportion]);

  useEffect(() => {
    localStorage.setItem("nodes", JSON.stringify(nodes));
  }, [nodes]);

  useEffect(() => {
    localStorage.setItem("edges", JSON.stringify(edges));
  }, [edges]);

  const onConnect = useCallback(
    (params) => connectNodes(nodes, edges, params, setNodes, setEdges),
    [nodes, edges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      createNode(event, reactFlowInstance, reactFlowWrapper, setNodes);
    },
    [reactFlowInstance]
  );

  useEffect(
    () => updateTree(nodes, edges, setNodes, setEdges), 
    [nodes, edges]
  )

  const selectedNode = nodes.find((node) => node.selected);
  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
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
