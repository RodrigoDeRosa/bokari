import { useState } from 'react';

function EditableValue({ initialValue, onUpdate, valueFormatter }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(initialValue.toString());

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setEditedValue(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(parseFloat(editedValue));
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleBlur();
    }
  };

  return isEditing ? (
    <input
      type="number"
      className="editable-field"
      value={editedValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      autoFocus
    />
  ) : (
    <p 
      className="editable-field" 
      onClick={handleEdit}
    >
      {valueFormatter(initialValue)}
    </p>
  );
}

export default EditableValue;
