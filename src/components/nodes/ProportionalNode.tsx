import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import formatCurrency from '../../utils/currency';
import EditableLabel from '../attributes/EditableLabel';
import EditableValue from '../attributes/EditableValue';
import useNodeHandlers from '../../utils/useNodeHandlers';
import type { RuntimeNodeData } from '../../types';

type RuntimeNode = Node<RuntimeNodeData>;

const ProportionalNode = ({ id, data }: NodeProps<RuntimeNode>) => {
  const { handleLabelChange, handleProportionChange } = useNodeHandlers(
    id,
    data.handleNodeDataChange,
  );

  const proportion = data.proportion ?? 0;
  const exceedsProportion = proportion > 100;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
      />
      <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
      <EditableValue
        initialValue={proportion}
        onUpdate={handleProportionChange}
        valueFormatter={(p) =>
          exceedsProportion ? `⚠ ${p}%` : `${p}%`
        }
      />
      <p
        className="non-editable-field"
        aria-live="polite"
        aria-label={`Calculated value: ${formatCurrency(data.value, data.currency)}`}
        style={data.value < 0 ? { color: '#ffccd5' } : undefined}
      >
        {formatCurrency(data.value, data.currency)}
      </p>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectableEnd={false}
      />
    </>
  );
};

export default ProportionalNode;
