import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import formatCurrency from '../../utils/currency';
import EditableLabel from '../attributes/EditableLabel';
import EditableValue from '../attributes/EditableValue';
import useNodeHandlers from '../../utils/useNodeHandlers';
import InvestmentBadge from './InvestmentBadge';
import type { RuntimeNodeData } from '../../types';

type RuntimeNode = Node<RuntimeNodeData>;

const FixedNode = ({ id, data }: NodeProps<RuntimeNode>) => {
  const { handleLabelChange, handleValueChange } = useNodeHandlers(
    id,
    data.handleNodeDataChange,
  );

  const handleInvestmentToggle = useCallback(() => {
    if (!data.isInvestment) {
      const conflicts = data.getInvestmentConflicts(id);
      if (conflicts.length > 0) {
        const descriptions = conflicts.map((c) => `${c.label} (${c.direction})`).join(', ');
        data.setInvestmentError(`Cannot mark as investment — conflicts with: ${descriptions}`);
        return;
      }
    }
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
      <EditableValue
        initialValue={data.value}
        onUpdate={handleValueChange}
        valueFormatter={(v) => formatCurrency(v, data.currency)}
      />
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

export default FixedNode;
