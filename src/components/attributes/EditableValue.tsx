import { useState } from 'react';

interface EditableValueProps {
  initialValue: number;
  onUpdate: (value: number) => void;
  valueFormatter: (value: number) => string;
}

function EditableValue({ initialValue, onUpdate, valueFormatter }: EditableValueProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(initialValue.toString());

  const handleEdit = () => {
    setEditedValue(initialValue.toString());
    setIsEditing(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedValue(event.target.value);
  };

  const isValid = editedValue === '' || !isNaN(parseFloat(editedValue));

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseFloat(editedValue);
    if (!isNaN(parsed)) {
      onUpdate(parsed);
    }
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

  const formatted = valueFormatter(initialValue);
  const isNegative = initialValue < 0;

  return isEditing ? (
    <input
      type="number"
      className="editable-field"
      value={editedValue}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      aria-label="Edit value"
      aria-invalid={!isValid}
      style={!isValid ? { borderColor: '#fb5607', boxShadow: '0 0 3px #fb5607' } : undefined}
      autoFocus
    />
  ) : (
    <p
      className="editable-field"
      onClick={handleEdit}
      onKeyDown={handleDisplayKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Value: ${formatted}. Press Enter to edit.`}
      aria-live="polite"
      style={isNegative ? { color: '#ffccd5' } : undefined}
    >
      {formatted}
    </p>
  );
}

export default EditableValue;
