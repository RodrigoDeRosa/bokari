import formatCurrency from "../../../utils/currency";
import EditableLabel from "../../attributes/EditableLabel";
import EditableValue from "../../attributes/EditableValue";

const FixedGroupChild = ({ id, label, value, onEdit, onDelete }) => {
  const onValueUpdate = (newValue) => {
    if (!isNaN(newValue) && newValue !== value)
      onEdit(id, { label: label, value: newValue });
  };

  const onLabelEdit = (newLabel) => {
    console.log(id, label, newLabel);
    if (newLabel !== label) onEdit(id, { label: newLabel, value: value });
  };

  return (
    <li className="fixed-group-child">
      <EditableLabel key={`${id}-label`} initialValue={label} onUpdate={onLabelEdit} />
      <EditableValue
        key={`${id}-value`}
        initialValue={value}
        valueFormatter={formatCurrency}
        onUpdate={onValueUpdate}
      />
      <button className="icon-button" onClick={() => onDelete(id)}>
        <i className="fa fa-trash"></i>
      </button>
    </li>
  );
};

export default FixedGroupChild;
