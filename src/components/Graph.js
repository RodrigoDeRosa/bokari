import { useCallback, useState, useEffect, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  SelectionMode
} from "reactflow";

import "reactflow/dist/style.css";
import FixedNode from "./nodes/FixedNode";
import ProportionalNode from "./nodes/ProportionalNode";
import RelativeNode from "./nodes/RelativeNode";
import RootNode from "./nodes/RootNode";
import AggregatorNode from "./nodes/AggregatorNode";
import Sidebar from "./Sidebar";
import updateTree from "../utils/updateTree";
import connectNodes from "../utils/connectNodes";
import { exampleNodes, exampleEdges } from "../data/exampleData";
import createNode from "../utils/createNode";
import FixedGroupNode from "./nodes/FixedGroupNode";
import Instructions from "./Instructions";

const nodeTypes = {
  fixedNode: FixedNode,
  proportionalNode: ProportionalNode,
  relativeNode: RelativeNode,
  rootNode: RootNode,
  aggregatorNode: AggregatorNode,
  fixedGroupNode: FixedGroupNode,
};

function useLocalStorage(key, initialValue) {
  return localStorage.getItem(key)
    ? JSON.parse(localStorage.getItem(key))
    : initialValue;
}

function updateLeafNodes(nodes) {
  return nodes.map((node) => {
    node.type = node.type === "leafNode" ? "aggregatorNode" : node.type;
    return node;
  });
}

function Graph() {
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // TODO -> Remove this after a while where we consider every possible
  // user doesn't have "leafNode" in their localStorage anymore
  const initialNodes = updateLeafNodes(useLocalStorage("nodes", exampleNodes));
  const initialEdges = useLocalStorage("edges", exampleEdges);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const saveToLocalStorage = () => {
    localStorage.setItem("nodes", JSON.stringify(nodes));
    localStorage.setItem("edges", JSON.stringify(edges));
  };

  const resetGraph = () => {
    localStorage.removeItem("nodes");
    localStorage.removeItem("edges");
    setNodes(exampleNodes);
    setEdges(exampleEdges);
  };

  const onConnect = useCallback(
    (params) => connectNodes(nodes, edges, params, setNodes, setEdges),
    [nodes, edges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => createNode(event, reactFlowInstance, reactFlowWrapper, setNodes),
    [reactFlowInstance, reactFlowWrapper]
  );

  useEffect(() => {
    if (reactFlowInstance && nodes.length > 0) {
      reactFlowInstance.fitView();
    }
  }, [reactFlowInstance]);

  useEffect(() => updateTree(nodes, edges, setNodes, setEdges), [nodes, edges]);

  useEffect(() => {
    const saveBeforeExit = () => {
      localStorage.setItem("nodes", JSON.stringify(nodes));
      localStorage.setItem("edges", JSON.stringify(edges));
    };

    window.addEventListener("beforeunload", saveBeforeExit);
    return () => {
      window.removeEventListener("beforeunload", saveBeforeExit);
    };
  }, [nodes, edges]);

  const handleNodeDataChange = (nodeId, newData) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id !== nodeId) return node;

      return {
        ...node,
        data: {
          ...node.data,
          ...newData,
        },
      };
    });

    setNodes(updatedNodes);
  };

  return (
    <div className="dndflow">
      <ReactFlowProvider>
        <Instructions saveToLocalStorage={saveToLocalStorage} resetGraph={resetGraph}/>
        <div className="reactflow-wrapper" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes.map((node) => ({
              ...node,
              data: {
                ...node.data,
                handleNodeDataChange,
              },
            }))}
            edges={edges}
            nodeTypes={nodeTypes}
            onInit={setReactFlowInstance}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            panOnScroll
            selectionOnDrag
            panOnDrag={[1, 2]}
            selectionMode={SelectionMode.Partial}
          />
        </div>
        <Sidebar />
      </ReactFlowProvider>
    </div>
  );
}

export default Graph;
