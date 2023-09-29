import { Handle, Position } from "reactflow";
import formatCurrency from "../../utils/currency";
import EditableLabel from "../attributes/EditableLabel";
import Node from "./Node";

class AggregatorNode extends Node {
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
        <p>{formatCurrency(data.value)}</p>
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

export default AggregatorNode;
