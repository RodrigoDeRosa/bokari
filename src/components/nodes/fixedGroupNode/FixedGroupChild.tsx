import DeleteIcon from '@mui/icons-material/Delete';
import formatCurrency from '../../../utils/currency';
import EditableLabel from '../../attributes/EditableLabel';
import EditableValue from '../../attributes/EditableValue';

interface FixedGroupChildProps {
  id: string;
  label: string;
  value: number;
  onEdit: (childId: string, newData: { label: string; value: number }) => void;
  onDelete: (id: string) => void;
  currency: string;
}

const FixedGroupChild = ({ id, label, value, onEdit, onDelete, currency }: FixedGroupChildProps) => {
  const onValueUpdate = (newValue: number) => {
    if (!isNaN(newValue) && newValue !== value)
      onEdit(id, { label, value: newValue });
  };

  const onLabelEdit = (newLabel: string) => {
    if (newLabel !== label) onEdit(id, { label: newLabel, value });
  };

  return (
    <li className="fixed-group-child">
      <EditableLabel key={`${id}-label`} initialValue={label} onUpdate={onLabelEdit} />
      <EditableValue
        key={`${id}-value`}
        initialValue={value}
        valueFormatter={(v) => formatCurrency(v, currency)}
        onUpdate={onValueUpdate}
      />
      <button className="icon-button" onClick={() => onDelete(id)} aria-label={`Delete ${label}`}>
        <DeleteIcon fontSize="small" />
      </button>
    </li>
  );
};

export default FixedGroupChild;
