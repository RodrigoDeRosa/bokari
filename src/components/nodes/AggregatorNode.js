import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import formatCurrency from "../../utils/currency";
import EditableLabel from "../attributes/EditableLabel";
import useNodeHandlers from "../../utils/useNodeHandlers";

const AggregatorNode = ({ id, data }) => {
  const { handleLabelChange } = useNodeHandlers(id, data.handleNodeDataChange);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
      />
      <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
      <p>{formatCurrency(data.value)}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectableEnd={false}
      />
    </>
  );
};

AggregatorNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

export default AggregatorNode;
