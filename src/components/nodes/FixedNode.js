import { Handle, Position } from "reactflow";
import formatCurrency from "../../utils/currency";
import EditableLabel from "../attributes/EditableLabel";
import EditableValue from "../attributes/EditableValue";
import Node from "./Node";

class FixedNode extends Node {
  render() {
    const { data, isConnectable } = this.props;

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
        <EditableValue
          initialValue={data.value}
          onUpdate={this.handleValueChange}
          valueFormatter={formatCurrency}
        />
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

export default FixedNode;
