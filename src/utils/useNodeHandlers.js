import { useCallback } from 'react';

const useNodeHandlers = (id, handleNodeDataChange) => {
  const handleLabelChange = useCallback((newLabel) => {
    handleNodeDataChange(id, { label: newLabel });
  }, [id, handleNodeDataChange]);

  const handleValueChange = useCallback((newValue) => {
    handleNodeDataChange(id, { value: newValue });
  }, [id, handleNodeDataChange]);

  const handleProportionChange = useCallback((newProportion) => {
    handleNodeDataChange(id, { proportion: newProportion });
  }, [id, handleNodeDataChange]);

  return { handleLabelChange, handleValueChange, handleProportionChange };
};

export default useNodeHandlers;
