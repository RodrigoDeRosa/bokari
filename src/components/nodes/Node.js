import { Component } from "react";

class Node extends Component {
  handleLabelChange = (newLabel) => {
    this.props.data.handleNodeDataChange(this.props.id, { label: newLabel });
  };

  handleValueChange = (newValue) => {
    this.props.data.handleNodeDataChange(this.props.id, { value: newValue });
  };

  handleProportionChange = (newProportion) => {
    this.props.data.handleNodeDataChange(this.props.id, { proportion: newProportion });
  };
}

export default Node;
