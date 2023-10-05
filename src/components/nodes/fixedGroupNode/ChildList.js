import FixedGroupChild from "./FixedGroupChild";

const ChildList = ({ children, onDelete, onChildEdit }) => (
  <ul className="no-bullets">
    {children.map(child => (
      <FixedGroupChild
        key={child.id}
        id={child.id}
        label={child.label}
        value={child.value}
        onEdit={onChildEdit}
        onDelete={onDelete}
      />
    ))}
  </ul>
);

export default ChildList;
