import PropTypes from "prop-types";
import { Handle, Position } from "reactflow";
import formatCurrency from "../../../utils/currency";
import "../../../css/fixedGroupNode.scss";
import "font-awesome/css/font-awesome.min.css";
import EditableLabel from "../../attributes/EditableLabel";
import { useState } from "react";
import useNodeHandlers from "../../../utils/useNodeHandlers";
import ChildList from "./ChildList";
import FixedCostInput from "./FixedCostInput";
import { v4 as uuid4 } from "uuid";

const FixedGroupNode = ({ id, data }) => {
  const [inputs, setInputs] = useState({
    labelInput: "",
    valueInput: "",
  });

  const totalValue = (children) => {
    return children.reduce((total, child) => total + child.value, 0);
  };

  const { handleLabelChange } = useNodeHandlers(id, data.handleNodeDataChange);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputs((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddChild = () => {
    const newChild = {
      id: uuid4(),
      label: inputs.labelInput,
      value: parseFloat(inputs.valueInput),
    };

    const children = [...data.children, newChild];
    data.handleNodeDataChange(id, {
      value: totalValue(children),
      children,
    });

    setInputs({ labelInput: "", valueInput: "" });
  };

  const handleChildUpdate = (childId, newChildData) => {
    const children = [...data.children];
    const childIndex = children.findIndex((child) => child.id === childId);
    
    if (childIndex !== -1) {
      children[childIndex] = { ...newChildData, id: childId };
    }
  
    data.handleNodeDataChange(id, {
      value: totalValue(children),
      children: children,
    });
  };

  const handleDeleteChild = (idToDelete) => {
    const children = data.children.filter(
      child => child.id !== idToDelete
    );
    data.handleNodeDataChange(id, {
      value: totalValue(children),
      children: children,
    });
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
      />
      <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
      <ChildList
        children={data.children}
        onDelete={handleDeleteChild}
        onChildEdit={handleChildUpdate}
      />
      <FixedCostInput
        labelInput={inputs.labelInput}
        valueInput={inputs.valueInput}
        onInputChange={handleInputChange}
        onAdd={handleAddChild}
      />
      <p className="non-editable-field">Total: {formatCurrency(data.value)}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectableEnd={false}
      />
    </>
  );
};

FixedGroupNode.propTypes = {
  id: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
};

export default FixedGroupNode;
