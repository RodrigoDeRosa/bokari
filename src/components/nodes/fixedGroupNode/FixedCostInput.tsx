import React from 'react';
import AddIcon from '@mui/icons-material/Add';
import { useTranslation } from 'react-i18next';

interface FixedCostInputProps {
  labelInput: string;
  valueInput: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAdd: () => void;
}

const FixedCostInput = ({ labelInput, valueInput, onInputChange, onAdd }: FixedCostInputProps) => {
  const { t } = useTranslation('nodes');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (labelInput && valueInput) {
      onAdd();
    }
  };

  return (
    <div>
      <label>{t('addFixedCost')}</label>
      <form onSubmit={handleSubmit} className="input-group">
        <input
          name="labelInput"
          value={labelInput}
          placeholder={t('costName')}
          onChange={onInputChange}
          autoComplete="off"
          aria-label={t('costNameAria')}
          required
        />
        <input
          name="valueInput"
          type="number"
          value={valueInput}
          placeholder={t('costValue')}
          onChange={onInputChange}
          autoComplete="off"
          aria-label={t('costValueAria')}
          required
        />
        <button type="submit" className="icon-button" aria-label={t('addCost')}>
          <AddIcon fontSize="small" />
        </button>
      </form>
    </div>
  );
};

export default FixedCostInput;
