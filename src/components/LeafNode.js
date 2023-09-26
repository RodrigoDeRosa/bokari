import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import formatCurrency from '../utils/currency';

export default memo(({ data, isConnectable }) => {
  return (
    <>
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: '#555' }}
        onConnect={(params) => console.log('handle onConnect', params)}
        isConnectable={isConnectable}
        isConnectableStart={false}
      />
      <p>{data.label}</p>
      <p>{formatCurrency(data.value)}</p>
    </>
  );
});