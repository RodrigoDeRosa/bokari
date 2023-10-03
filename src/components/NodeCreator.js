import React from "react";

export default () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside>
      <h2>Drag a node from here</h2>
      <div className="node-creator rootNode">
        <div
          className="dndnode rootNode"
          onDragStart={(event) => onDragStart(event, "rootNode")}
          draggable
        >
          Root Node
        </div>
        <div className="description">
          Start your budget tree with a Root Node. It can't link "upwards" but
          you can connect it "downwards" to other expense categories.
        </div>
      </div>
      <div className="node-creator fixedNode">
        <div
          className="dndnode fixedNode"
          onDragStart={(event) => onDragStart(event, "fixedNode")}
          draggable
        >
          Fixed Node
        </div>
        <div className="description">
          Use Fixed Nodes for regular expenses like rent, subscriptions or
          credit card.
        </div>
      </div>
      <div className="node-creator proportionalNode">
        <div
          className="dndnode proportionalNode"
          onDragStart={(event) => onDragStart(event, "proportionalNode")}
          draggable
        >
          Proportional Node
        </div>
        <div className="description">
          Proportional Nodes let you set aside a certain percentage of your
          budget for specific expenses or savings.
        </div>
      </div>
      <div className="node-creator aggregatorNode">
        <div
          className="dndnode aggregatorNode"
          onDragStart={(event) => onDragStart(event, "aggregatorNode")}
          draggable
        >
          Aggregator Node
        </div>
        <div className="description">
          Aggregator Nodes help you group various expenses together, providing a
          summarized view of collective costs.
        </div>
      </div>
      <div className="node-creator fixedGroupNode">
        <div
          className="dndnode fixedGroupNode"
          onDragStart={(event) => onDragStart(event, "fixedGroupNode")}
          draggable
        >
          Fixed Group Node
        </div>
        <div className="description">
          Group similar fixed expenses, like rent and utilities, under a Fixed
          Group Node to track them collectively.
        </div>
      </div>
      <div className="node-creator relativeNode">
        <div
          className="dndnode relativeNode"
          onDragStart={(event) => onDragStart(event, "relativeNode")}
          draggable
        >
          Relative Node
        </div>
        <div className="description">
          Relative Nodes automatically calculate and show the remaining budget
          after accounting for other connected expenses.
        </div>
      </div>
    </aside>
  );
};
