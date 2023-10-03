export default () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside>
      <div className="node-creator rootNode">
        <div className="dndnode rootNode" onDragStart={(event) => onDragStart(event, 'rootNode')} draggable>
          Root Node
        </div>
        <div className="description">
          A root node is supposed to be used as the starting point of any tree. These nodes can't have parents;
          this means that you can only connect them from the bottom as the parent of some other node.
        </div>
      </div>
      <div className="node-creator fixedNode">
        <div className="dndnode fixedNode" onDragStart={(event) => onDragStart(event, 'fixedNode')} draggable>
          Fixed Node
        </div>
        <div className="description">
          A fixed node is supposed to be used for (as the name indicates) values that don't vary; for example, some
          subscription or your rent.
        </div>
      </div>
      <div className="node-creator proportionalNode">
        <div className="dndnode proportionalNode" onDragStart={(event) => onDragStart(event, 'proportionalNode')} draggable>
          Proportional Node
        </div>
        <div className="description">
          A proportional node allows you to indicate what percentage of the node's parent you want it to represent.
          If a node has a value of 1000 and you create a child proportional node with proportion 30%, then the value
          of this new child node will be 300.
        </div>
      </div>
      <div className="node-creator aggregatorNode">
        <div className="dndnode aggregatorNode" onDragStart={(event) => onDragStart(event, 'aggregatorNode')} draggable>
          Aggregator Node
        </div>  
        <div className="description">
          An aggregator node can be used to collect the values of multiple nodes; you can use this for example if you have
          two different trees and you want some branch of one of them to connect to some branch of the other.
        </div>
      </div>
      <div className="node-creator fixedGroupNode">
        <div className="dndnode fixedGroupNode" onDragStart={(event) => onDragStart(event, 'fixedGroupNode')} draggable>
          Fixed Group Node
        </div>
        <div className="description">
          If you have multiple fixed amounts that belong to the same category and don't really make sense as separated
          nodes (think of a set of base expenses), you can use these node to centralize all. It works like a Fixed Node
          but it allows you to add multiple values inside of it.
        </div>
      </div>
      <div className="node-creator relativeNode">
        <div className="dndnode relativeNode" onDragStart={(event) => onDragStart(event, 'relativeNode')} draggable>
          Relative Node
        </div>
        <div className="description">
          A relative node simply represents "all that's left over" from a parent node. It is expected that any node
          can have at most one relative node and its value will always be the parent's value minus all of the relative
          node's sibling's values.
        </div>
      </div>
    </aside>
  );
};