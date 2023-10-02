import formatCurrency from "../../../utils/currency";

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
