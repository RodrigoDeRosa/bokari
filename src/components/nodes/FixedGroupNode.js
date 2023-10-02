import { Handle, Position } from "reactflow";
import formatCurrency from "../../utils/currency";
import "../../css/fixedGroupNode.scss";
import "font-awesome/css/font-awesome.min.css";
import EditableLabel from "../attributes/EditableLabel";
import Node from "./Node";

class FixedGroupNode extends Node {
  constructor(props) {
    super(props);
    this.state = {
      labelInput: "",
      valueInput: "",
    };
  }

  handleInputChange = (event) => {
    const { name, value } = event.target;
    this.setState({ [name]: value });
  };

  handleAddChild = () => {
    const { labelInput, valueInput } = this.state;

    const newChild = {
      label: labelInput,
      value: parseFloat(valueInput),
    };

    let children = this.props.data.children.concat(newChild);
    this.props.data.handleNodeDataChange(this.props.id, {
      value: children.reduce((total, child) => total + child.value, 0),
      children: children,
    });

    this.setState({ labelInput: "", valueInput: "" });
  };

  handleDeleteChild = (indexToDelete) => {
    let children = this.props.data.children.filter(
      (_, index) => index !== indexToDelete
    );

    this.props.data.handleNodeDataChange(this.props.id, {
      value: children.reduce((total, child) => total + child.value, 0),
      children: children,
    });
  };

  render() {
    const { data, isConnectable } = this.props;
    const { labelInput, valueInput } = this.state;

    const listItems = data.children.map((child, index) => (
      <li key={index}>
        {child.label}: {formatCurrency(child.value)}
        <button
          className="icon-button"
          onClick={() => this.handleDeleteChild(index)}
        >
          <i className="fa fa-trash"></i>
        </button>
      </li>
    ));

    return (
      <>
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: "white", borderColor: "#555"}}
          isConnectable={isConnectable}
          isConnectableStart={false}
        />
        <EditableLabel
          initialValue={data.label}
          onUpdate={this.handleLabelChange}
        />
        <ul className="no-bullets">{listItems}</ul>
        <label>Add Fixed Cost:</label>
        <div className="input-group">
          <input
            name="labelInput"
            value={labelInput}
            placeholder="Name"
            onChange={this.handleInputChange}
          />
          <input
            name="valueInput"
            type="number"
            value={valueInput}
            placeholder="Value"
            onChange={this.handleInputChange}
          />
          <button className="icon-button" onClick={this.handleAddChild}>
            <i className="fa fa-plus"></i>
          </button>
        </div>
        <p>Total: {formatCurrency(data.value)}</p>
        <Handle
          type="source"
          position={Position.Bottom}
          id="a"
          style={{ background: "#555" }}
          isConnectable={isConnectable}
          isConnectableEnd={false}
        />
      </>
    );
  }
}

export default FixedGroupNode;
