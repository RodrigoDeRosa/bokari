import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import formatCurrency from '../../utils/currency';
import EditableLabel from '../attributes/EditableLabel';
import useNodeHandlers from '../../utils/useNodeHandlers';
import InvestmentBadge from './InvestmentBadge';
import type { RuntimeNodeData } from '../../types';

type RuntimeNode = Node<RuntimeNodeData>;

const RelativeNode = ({ id, data }: NodeProps<RuntimeNode>) => {
  const { handleLabelChange } = useNodeHandlers(id, data.handleNodeDataChange);

  const handleInvestmentToggle = useCallback(() => {
    data.handleNodeDataChange(id, {
      isInvestment: !data.isInvestment,
      ...(!data.isInvestment && data.expectedReturn === undefined && { expectedReturn: 7 }),
    });
  }, [id, data]);

  const handleReturnChange = useCallback((rate: number) => {
    data.handleNodeDataChange(id, { expectedReturn: rate });
  }, [id, data]);

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
      />
      <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
      <p
        className="non-editable-field"
        aria-live="polite"
        aria-label={`Remaining: ${formatCurrency(data.value, data.currency)}`}
        style={data.value < 0 ? { color: '#ffccd5' } : undefined}
      >
        {formatCurrency(data.value, data.currency)}
      </p>
      <InvestmentBadge
        isInvestment={!!data.isInvestment}
        expectedReturn={data.expectedReturn ?? 7}
        onToggle={handleInvestmentToggle}
        onReturnChange={handleReturnChange}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectableEnd={false}
      />
    </>
  );
};

export default RelativeNode;
