import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { useTranslation } from 'react-i18next';
import formatCurrency from '../../utils/currency';
import EditableLabel from '../attributes/EditableLabel';
import EditableValue from '../attributes/EditableValue';
import useNodeHandlers from '../../utils/useNodeHandlers';
import InvestmentBadge from './InvestmentBadge';
import type { RuntimeNodeData } from '../../types';

type RuntimeNode = Node<RuntimeNodeData>;

const AssetNode = ({ id, data }: NodeProps<RuntimeNode>) => {
  const { handleLabelChange } = useNodeHandlers(
    id,
    data.handleNodeDataChange,
  );
  const { t } = useTranslation('nodes');

  const handleInitialValueChange = useCallback((value: number) => {
    data.handleNodeDataChange(id, { initialValue: value });
  }, [id, data]);

  const handleReturnChange = useCallback((rate: number) => {
    data.handleNodeDataChange(id, { expectedReturn: rate });
  }, [id, data]);

  const injectionTotal = data.injectionTotal ?? 0;

  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        isConnectableStart={false}
      />
      <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
      <EditableValue
        initialValue={data.initialValue ?? 0}
        onUpdate={handleInitialValueChange}
        valueFormatter={(v) => formatCurrency(v, data.currency)}
      />
      <InvestmentBadge
        isInvestment
        expectedReturn={data.expectedReturn ?? 7}
        onToggle={() => {}} // always-on for asset nodes
        onReturnChange={handleReturnChange}
      />
      <div className="injection-summary">
        {injectionTotal > 0
          ? t('injectionContributed', { amount: formatCurrency(injectionTotal, data.currency) })
          : t('noContributions')}
      </div>
    </>
  );
};

export default AssetNode;
