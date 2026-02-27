import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import formatCurrency from '../../../utils/currency';
import '../../../css/fixedGroupNode.scss';
import EditableLabel from '../../attributes/EditableLabel';
import { useState } from 'react';
import useNodeHandlers from '../../../utils/useNodeHandlers';
import ChildList from './ChildList';
import FixedCostInput from './FixedCostInput';
import { v4 as uuid4 } from 'uuid';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { RuntimeNodeData, FixedGroupChild } from '../../../types';

type RuntimeNode = Node<RuntimeNodeData>;

const FixedGroupNode = ({ id, data }: NodeProps<RuntimeNode>) => {
  const [collapsed, setCollapsed] = useState(false);
  const [inputs, setInputs] = useState({
    labelInput: '',
    valueInput: '',
  });

  const totalValue = (children: FixedGroupChild[]) => {
    return children.reduce((total, child) => total + child.value, 0);
  };

  const { handleLabelChange } = useNodeHandlers(id, data.handleNodeDataChange);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setInputs((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleAddChild = () => {
    const newChild: FixedGroupChild = {
      id: uuid4(),
      label: inputs.labelInput,
      value: parseFloat(inputs.valueInput),
    };

    const children = [...(data.children ?? []), newChild];
    data.handleNodeDataChange(id, {
      value: totalValue(children),
      children,
    });

    setInputs({ labelInput: '', valueInput: '' });
  };

  const handleChildUpdate = (childId: string, newChildData: { label: string; value: number }) => {
    const children = [...(data.children ?? [])];
    const childIndex = children.findIndex((child) => child.id === childId);

    if (childIndex !== -1) {
      children[childIndex] = { ...newChildData, id: childId };
    }

    data.handleNodeDataChange(id, {
      value: totalValue(children),
      children,
    });
  };

  const handleDeleteChild = (idToDelete: string) => {
    const children = (data.children ?? []).filter(
      (child) => child.id !== idToDelete,
    );
    data.handleNodeDataChange(id, {
      value: totalValue(children),
      children,
    });
  };

  const childCount = (data.children ?? []).length;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
      />
      <div className="fixed-group-header">
        <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
        <button
          className="icon-button collapse-toggle"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand group' : 'Collapse group'}
        >
          {collapsed ? <ExpandMoreIcon fontSize="small" /> : <ExpandLessIcon fontSize="small" />}
        </button>
      </div>
      {!collapsed && (
        <>
          <ChildList
            children={data.children ?? []}
            onDelete={handleDeleteChild}
            onChildEdit={handleChildUpdate}
            currency={data.currency}
          />
          <FixedCostInput
            labelInput={inputs.labelInput}
            valueInput={inputs.valueInput}
            onInputChange={handleInputChange}
            onAdd={handleAddChild}
          />
        </>
      )}
      <p className="non-editable-field">
        {collapsed && childCount > 0 ? `(${childCount}) ` : ''}
        Total: {formatCurrency(data.value, data.currency)}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectableEnd={false}
      />
    </>
  );
};

export default FixedGroupNode;
