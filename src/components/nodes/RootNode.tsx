import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import formatCurrency from '../../utils/currency';
import EditableLabel from '../attributes/EditableLabel';
import EditableValue from '../attributes/EditableValue';
import useNodeHandlers from '../../utils/useNodeHandlers';
import type { RuntimeNodeData } from '../../types';

type RuntimeNode = Node<RuntimeNodeData>;

const RootNode = ({ id, data }: NodeProps<RuntimeNode>) => {
  const { handleLabelChange, handleValueChange } = useNodeHandlers(
    id,
    data.handleNodeDataChange,
  );

  return (
    <>
      <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
      <EditableValue
        initialValue={data.value}
        onUpdate={handleValueChange}
        valueFormatter={(v) => formatCurrency(v, data.currency)}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectableEnd={false}
      />
    </>
  );
};

export default RootNode;
