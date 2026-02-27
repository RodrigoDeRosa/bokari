import FixedGroupChild from './FixedGroupChild';
import type { FixedGroupChild as FixedGroupChildType } from '../../../types';

interface ChildListProps {
  children: FixedGroupChildType[];
  onDelete: (id: string) => void;
  onChildEdit: (childId: string, newData: { label: string; value: number }) => void;
  currency: string;
}

const ChildList = ({ children, onDelete, onChildEdit, currency }: ChildListProps) => (
  <ul className="no-bullets">
    {children.map((child) => (
      <FixedGroupChild
        key={child.id}
        id={child.id}
        label={child.label}
        value={child.value}
        onEdit={onChildEdit}
        onDelete={onDelete}
        currency={currency}
      />
    ))}
  </ul>
);

export default ChildList;
