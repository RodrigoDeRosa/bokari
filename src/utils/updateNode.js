export default function updateSelectedNode(nodes, attribute, value, setNodes) {
  nodes
    .filter((node) => node.selected)
    .forEach((node) => {
      let updatedData = { ...node.data };
      updatedData[attribute] = value;
      node.data = { ...updatedData };
    });
  setNodes((nds) => nds.map((node) => node));
}
