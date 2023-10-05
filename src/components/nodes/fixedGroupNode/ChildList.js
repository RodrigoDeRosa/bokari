import formatCurrency from "../../../utils/currency";
import EditableChild from "./EditableChild";

const EditableChildList = ({ children, onDelete, onChildEdit }) => (
  <ul className="no-bullets">
    {children.map((child, index) => (
      <EditableChild
        key={index}
        label={child.label}
        value={child.value}
        index={index}
        onEdit={onChildEdit}
        onDelete={onDelete}
      />
    ))}
  </ul>
);

const ChildList = ({ children, onDelete }) => (
  <ul className="no-bullets">
    {children.map((child, index) => (
      <li key={index}>
        {child.label}: {formatCurrency(child.value)}
        <button className="icon-button" onClick={() => onDelete(index)}>
          <i className="fa fa-trash"></i>
        </button>
      </li>
    ))}
  </ul>
);

export default ChildList;
