import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';

export default memo(({ data, isConnectable }) => {
  return (
    <>
      <p>{data.label}</p>
      <p>{data.value}</p>
      <Handle
        type="source"
        position={Position.Bottom}
        id="a"
        style={{ background: '#555' }}
        isConnectable={isConnectable}
        isConnectableEnd={false}
      />
    </>
  );
});