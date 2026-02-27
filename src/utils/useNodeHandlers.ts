import { useCallback } from 'react';

const useNodeHandlers = (id: string, handleNodeDataChange: (nodeId: string, newData: Record<string, unknown>) => void) => {
  const handleLabelChange = useCallback((newLabel: string) => {
    handleNodeDataChange(id, { label: newLabel });
  }, [id, handleNodeDataChange]);

  const handleValueChange = useCallback((newValue: number) => {
    handleNodeDataChange(id, { value: newValue });
  }, [id, handleNodeDataChange]);

  const handleProportionChange = useCallback((newProportion: number) => {
    handleNodeDataChange(id, { proportion: newProportion });
  }, [id, handleNodeDataChange]);

  return { handleLabelChange, handleValueChange, handleProportionChange };
};

export default useNodeHandlers;
