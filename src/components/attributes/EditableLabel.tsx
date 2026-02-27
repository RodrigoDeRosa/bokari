import { useState, useRef } from 'react';

interface EditableLabelProps {
  initialValue: string;
  onUpdate: (value: string) => void;
}

function EditableLabel({ initialValue, onUpdate }: EditableLabelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(initialValue);
  const labelRef = useRef<HTMLParagraphElement>(null);
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

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditedValue(event.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onUpdate(editedValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleBlur();
    }
  };

  const handleDisplayKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleEdit();
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
      aria-label="Edit label"
      autoFocus
    />
  ) : (
    <p
      className="editable-field"
      onClick={handleEdit}
      onKeyDown={handleDisplayKeyDown}
      ref={labelRef}
      role="button"
      tabIndex={0}
      aria-label={`Label: ${initialValue}. Press Enter to edit.`}
    >
      {initialValue}
    </p>
  );
}

export default EditableLabel;
