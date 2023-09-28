const displayableTypes = {
  ["rootNode"]: "Root Node",
  ["proportionalNode"]: "Proportional Node",
  ["fixedNode"]: "Fixed Node",
  ["aggregatorNode"]: "Aggregator Node",
  ["relativeNode"]: "Relative Node",
};

function NodeData({ selectedNode, setNodeName }) {
  return selectedNode != null ? (
    <div>
      <label className="updatenode__bglabel">Node Type: {displayableTypes[selectedNode.type]}</label>
      <label className="updatenode__bglabel">Label:</label>
      <input
        className="updatenode__bginput"
        value={selectedNode?.data.label}
        onChange={(evt) => setNodeName(evt.target.value)}
      />
    </div>
  ) : (
    <></>
  );
}

function AttributeEditor({ selectedNode, setNodeValue, setNodeProportion }) {
  if (selectedNode?.type === "proportionalNode") {
    return (
      <div>
        <label className="updatenode__bglabel">Proportion:</label>
        <input
          className="updatenode__bginput"
          type="number"
          value={selectedNode?.data.proportion}
          onChange={(evt) => setNodeProportion(evt.target.value)}
        />
      </div>
    );
  }

  if (selectedNode?.type === "fixedNode" || selectedNode?.type === "rootNode") {
    return (
      <div>
        <label className="updatenode__bglabel">Value:</label>
        <input
          className="updatenode__bginput"
          type="number"
          value={selectedNode?.data.value}
          onChange={(evt) => setNodeValue(evt.target.value)}
        />
      </div>
    );
  }

  return <></>;
}

export default ({
  selectedNode,
  setNodeName,
  setNodeValue,
  setNodeProportion,
}) => {
  return (
    <div className="updatenode__controls">
      <NodeData selectedNode={selectedNode} setNodeName={setNodeName} />
      <AttributeEditor
        selectedNode={selectedNode}
        setNodeValue={setNodeValue}
        setNodeProportion={setNodeProportion}
      />
    </div>
  );
};
