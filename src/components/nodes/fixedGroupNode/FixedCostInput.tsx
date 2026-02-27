import React from 'react';
import AddIcon from '@mui/icons-material/Add';

interface FixedCostInputProps {
  labelInput: string;
  valueInput: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
}

const FixedCostInput = ({ labelInput, valueInput, onInputChange, onAdd }: FixedCostInputProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (labelInput && valueInput) {
      onAdd();
    }
  };

  return (
    <div>
      <label>Add Fixed Cost:</label>
      <form onSubmit={handleSubmit} className="input-group">
        <input
          name="labelInput"
          value={labelInput}
          placeholder="Name"
          onChange={onInputChange}
          autoComplete="off"
          aria-label="Cost name"
          required
        />
        <input
          name="valueInput"
          type="number"
          value={valueInput}
          placeholder="Value"
          onChange={onInputChange}
          autoComplete="off"
          aria-label="Cost value"
          required
        />
        <button type="submit" className="icon-button" aria-label="Add cost">
          <AddIcon fontSize="small" />
        </button>
      </form>
    </div>
  );
};

export default FixedCostInput;
