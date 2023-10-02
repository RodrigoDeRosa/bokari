import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import formatCurrency from "../../utils/currency";
import EditableLabel from "../attributes/EditableLabel";
import EditableValue from "../attributes/EditableValue";
import useNodeHandlers from "../../utils/useNodeHandlers";

const FixedNode = ({id, data }) => {
  const { handleLabelChange, handleValueChange } = useNodeHandlers(
    id,
    data.handleNodeDataChange
  );

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
      />
      <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
      <EditableValue
        initialValue={data.value}
        onUpdate={handleValueChange}
        valueFormatter={formatCurrency}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectableEnd={false}
      />
    </>
  );
};

FixedNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

export default FixedNode;
