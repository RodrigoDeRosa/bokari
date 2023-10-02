import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import formatCurrency from "../../utils/currency";
import EditableLabel from "../attributes/EditableLabel";
import EditableValue from "../attributes/EditableValue";
import useNodeHandlers from "../../utils/useNodeHandlers";

const ProportionalNode = ({ id, data }) => {
  const { handleLabelChange, handleProportionChange } = useNodeHandlers(
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
        initialValue={data.proportion}
        onUpdate={handleProportionChange}
        valueFormatter={(proportion) => `${proportion}%`}
      />
      <p>{formatCurrency(data.value)}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectableEnd={false}
      />
    </>
  );
};

ProportionalNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

export default ProportionalNode;
