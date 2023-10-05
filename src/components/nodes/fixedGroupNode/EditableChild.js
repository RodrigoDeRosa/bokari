import { useState } from "react";
import formatCurrency from "../../../utils/currency";

const EditableChild = ({ label, value, index, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editLabel, setEditLabel] = useState(label);
    const [editValue, setEditValue] = useState(value);
    // TODO -> Make this nicer, this is in essence what I want
    const handleLabelDoubleClick = () => {
      setIsEditing(true);
    };
  
    const handleEdit = () => {
      if (isEditing) {
        onEdit(index, editLabel, editValue);
      }
      setIsEditing(false);
    };
  
    const handleKeyPress = (e) => {
      if (e.key === "Enter") {
        handleEdit();
      }
    };
  
    return (
      <li>
        {isEditing ? (
          <>
            <input
              value={editLabel}
              onChange={(e) => setEditLabel(e.target.value)}
              onBlur={handleEdit}
              onKeyPress={handleKeyPress}
              autoFocus
            />
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleEdit}
              onKeyPress={handleKeyPress}
            />
          </>
        ) : (
          <>
            <span onDoubleClick={handleLabelDoubleClick}>
              {label}: {formatCurrency(value)}
            </span>
          </>
        )}
        <button className="icon-button" onClick={() => onDelete(index)}>
          <i className="fa fa-trash"></i>
        </button>
      </li>
    );
  };
  
  export default EditableChild;