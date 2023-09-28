export default () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div className="description">You can drag these nodes to the pane on the left.</div>
      <div className="dndnode rootNode" onDragStart={(event) => onDragStart(event, 'rootNode')} draggable>
        Root Node
      </div>
      <div className="dndnode fixedNode" onDragStart={(event) => onDragStart(event, 'fixedNode')} draggable>
        Fixed Node
      </div>
      <div className="dndnode proportionalNode" onDragStart={(event) => onDragStart(event, 'proportionalNode')} draggable>
        Proportional Node
      </div>
      <div className="dndnode relativeNode" onDragStart={(event) => onDragStart(event, 'relativeNode')} draggable>
        Relative Node
      </div>
      <div className="dndnode aggregatorNode" onDragStart={(event) => onDragStart(event, 'aggregatorNode')} draggable>
        Aggregator Node
      </div>
    </aside>
  );
};