import { useState, useCallback } from 'react';
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

  const annualGrowth = data.annualGrowth ?? 0;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(annualGrowth));

  const handleCommit = useCallback(() => {
    setEditing(false);
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
      data.handleNodeDataChange(id, { annualGrowth: parsed });
    } else {
      setDraft(String(annualGrowth));
    }
  }, [draft, annualGrowth, data, id]);

  return (
    <>
      <EditableLabel initialValue={data.label} onUpdate={handleLabelChange} />
      <EditableValue
        initialValue={data.value}
        onUpdate={handleValueChange}
        valueFormatter={(v) => formatCurrency(v, data.currency)}
      />
      <div className="growth-badge">
        {editing ? (
          <input
            className="growth-input"
            type="number"
            value={draft}
            autoFocus
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === 'Enter') handleCommit();
              if (e.key === 'Escape') {
                setDraft(String(annualGrowth));
                setEditing(false);
              }
            }}
          />
        ) : (
          <span
            className="growth-label"
            onClick={(e) => {
              e.stopPropagation();
              setDraft(String(annualGrowth));
              setEditing(true);
            }}
          >
            +{annualGrowth.toFixed(1)}%/yr
          </span>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectableEnd={false}
      />
    </>
  );
};

export default RootNode;
