import { useState, useRef } from 'react';

function EditableLabel({ initialValue, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(initialValue);
  const labelRef = useRef(null);
  const [rows, setRows] = useState(1);

  const calculateRows = () => {
    if (labelRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(labelRef.current).lineHeight, 10);
      const height = labelRef.current.clientHeight;
      const calculatedRows = Math.round(height / lineHeight);
      setRows(calculatedRows);
    }
  };

  const handleEdit = () => {
    calculateRows();
    setIsEditing(true);
  };

  const handleChange = (event) => {
    setEditedValue(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(editedValue);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleBlur();
    }
  };

  return isEditing ? (
    <textarea
      rows={rows}
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
      ref={labelRef}
    >
      {initialValue}
    </p>
  );
}

export default EditableLabel;
