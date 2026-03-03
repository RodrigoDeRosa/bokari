import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import formatCurrency from '../../utils/currency';
import EditableLabel from '../attributes/EditableLabel';
import useNodeHandlers from '../../utils/useNodeHandlers';
import type { RuntimeNodeData } from '../../types';

type RuntimeNode = Node<RuntimeNodeData>;

const AggregatorNode = ({ id, data }: NodeProps<RuntimeNode>) => {
  const { handleLabelChange } = useNodeHandlers(id, data.handleNodeDataChange);
  const { t } = useTranslation('nodes');

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
      />
      <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
      <p className="non-editable-field" aria-live="polite" aria-label={t('totalValue', { value: formatCurrency(data.value, data.currency) })}>
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

export default AggregatorNode;
