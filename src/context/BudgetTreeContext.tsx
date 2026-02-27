import { createContext, useContext, useCallback, useEffect, useRef, useState } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import type { Connection, NodeChange, EdgeChange, OnNodesChange, OnEdgesChange, ReactFlowInstance } from '@xyflow/react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import type { BokariNode, BokariEdge, InvestmentConflict } from '../types';
import { exampleNodes, exampleEdges } from '../data/exampleData';
import { loadState, saveState, clearState } from '../utils/migration';
import {
  createUndoRedoState,
  pushSnapshot,
  undo as undoFn,
  redo as redoFn,
  canUndo as canUndoFn,
  canRedo as canRedoFn,
} from '../hooks/useUndoRedo';
import type { UndoRedoState, BudgetTreeSnapshot } from '../hooks/useUndoRedo';
import updateTree from '../utils/updateTree';
import connectNodes from '../utils/connectNodes';
import { exportToJSON, downloadJSON, importFromJSON } from '../utils/serialization';
import autoLayoutUtil from '../utils/autoLayout';
import { findInvestmentConflicts } from '../utils/investmentValidation';

interface BudgetTreeContextValue {
  nodes: BokariNode[];
  edges: BokariEdge[];
  currency: string;
  setCurrency: (currency: string) => void;
  onNodesChange: OnNodesChange<BokariNode>;
  onEdgesChange: OnEdgesChange<BokariEdge>;
  onConnect: (connection: Connection) => void;
  handleNodeDataChange: (nodeId: string, newData: Record<string, unknown>) => void;
  getInvestmentConflicts: (nodeId: string) => InvestmentConflict[];
  setInvestmentError: (message: string | null) => void;
  setNodes: React.Dispatch<React.SetStateAction<BokariNode[]>>;
  setEdges: React.Dispatch<React.SetStateAction<BokariEdge[]>>;
  save: () => void;
  reset: () => void;
  undoAction: () => void;
  redoAction: () => void;
  canUndo: boolean;
  canRedo: boolean;
  exportGraph: () => void;
  importGraph: (json: string) => string | null;
  takeSnapshot: () => void;
  autoLayout: () => void;
  setReactFlowInstance: (instance: ReactFlowInstance) => void;
}

const BudgetTreeContext = createContext<BudgetTreeContextValue | null>(null);

export function useBudgetTree(): BudgetTreeContextValue {
  const ctx = useContext(BudgetTreeContext);
  if (!ctx) throw new Error('useBudgetTree must be used within BudgetTreeProvider');
  return ctx;
}

export function BudgetTreeProvider({ children }: { children: React.ReactNode }) {
  const persisted = loadState(exampleNodes as BokariNode[], exampleEdges as BokariEdge[]);

  const [nodes, setNodes, onNodesChange] = useNodesState(persisted.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(persisted.edges);
  const [currency, setCurrencyState] = useState(persisted.currency);

  const reactFlowInstanceRef = useRef<ReactFlowInstance | null>(null);
  const [investmentError, setInvestmentError] = useState<string | null>(null);

  const setReactFlowInstance = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

  const undoRedoRef = useRef<UndoRedoState>(
    createUndoRedoState({ nodes: persisted.nodes, edges: persisted.edges, currency: persisted.currency }),
  );

  const [undoRedoVersion, setUndoRedoVersion] = useState(0);

  const takeSnapshot = useCallback(() => {
    const snapshot: BudgetTreeSnapshot = {
      nodes: JSON.parse(JSON.stringify(nodes)),
      edges: JSON.parse(JSON.stringify(edges)),
      currency,
    };
    undoRedoRef.current = pushSnapshot(undoRedoRef.current, snapshot);
    setUndoRedoVersion((v) => v + 1);
  }, [nodes, edges, currency]);

  const applySnapshot = useCallback((snapshot: BudgetTreeSnapshot) => {
    setNodes(snapshot.nodes);
    setEdges(snapshot.edges);
    setCurrencyState(snapshot.currency);
  }, [setNodes, setEdges]);

  const undoAction = useCallback(() => {
    const newState = undoFn(undoRedoRef.current);
    if (newState !== undoRedoRef.current) {
      undoRedoRef.current = newState;
      applySnapshot(newState.present);
      setUndoRedoVersion((v) => v + 1);
    }
  }, [applySnapshot]);

  const redoAction = useCallback(() => {
    const newState = redoFn(undoRedoRef.current);
    if (newState !== undoRedoRef.current) {
      undoRedoRef.current = newState;
      applySnapshot(newState.present);
      setUndoRedoVersion((v) => v + 1);
    }
  }, [applySnapshot]);

  const handleNodeDataChange = useCallback((nodeId: string, newData: Record<string, unknown>) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== nodeId) return node;
        return { ...node, data: { ...node.data, ...newData } };
      }),
    );
  }, [setNodes]);

  const getInvestmentConflicts = useCallback((nodeId: string): InvestmentConflict[] => {
    return findInvestmentConflicts(nodeId, nodes as BokariNode[], edges);
  }, [nodes, edges]);

  const onConnect = useCallback(
    (params: Connection) => {
      takeSnapshot();
      connectNodes(
        nodes as BokariNode[],
        edges,
        params,
        setNodes,
        setEdges,
      );
    },
    [nodes, edges, setNodes, setEdges, takeSnapshot],
  );

  const setCurrency = useCallback((newCurrency: string) => {
    takeSnapshot();
    setCurrencyState(newCurrency);
  }, [takeSnapshot]);

  // Tree recalculation — compute derived values without causing infinite loops
  useEffect(() => {
    const computed = updateTree(nodes as BokariNode[], edges);
    // Only update if any node value actually changed
    const changed = computed.some((node, i) => {
      const original = nodes[i] as BokariNode | undefined;
      return !original || node.data.value !== original.data.value;
    });
    if (changed) {
      setNodes(computed);
    }
  }, [nodes, edges, setNodes]);

  // Auto-save before unload
  useEffect(() => {
    const saveBeforeExit = () => {
      saveState({ version: 2, currency, nodes: nodes as BokariNode[], edges });
    };
    window.addEventListener('beforeunload', saveBeforeExit);
    return () => window.removeEventListener('beforeunload', saveBeforeExit);
  }, [nodes, edges, currency]);

  const save = useCallback(() => {
    saveState({ version: 2, currency, nodes: nodes as BokariNode[], edges });
  }, [nodes, edges, currency]);

  const reset = useCallback(() => {
    takeSnapshot();
    clearState();
    setNodes(exampleNodes as BokariNode[]);
    setEdges(exampleEdges as BokariEdge[]);
    setCurrencyState('EUR');
  }, [setNodes, setEdges, takeSnapshot]);

  const exportGraph = useCallback(() => {
    const json = exportToJSON(nodes as BokariNode[], edges, currency);
    const filename = `bokari-budget-${new Date().toISOString().slice(0, 10)}.json`;
    downloadJSON(json, filename);
  }, [nodes, edges, currency]);

  const importGraph = useCallback((json: string): string | null => {
    try {
      const imported = importFromJSON(json);
      takeSnapshot();
      setNodes(imported.nodes);
      setEdges(imported.edges);
      setCurrencyState(imported.currency);
      return null;
    } catch (e) {
      return e instanceof Error ? e.message : 'Import failed';
    }
  }, [setNodes, setEdges, takeSnapshot]);

  const autoLayout = useCallback(() => {
    takeSnapshot();
    const laid = autoLayoutUtil(nodes as BokariNode[], edges);
    setNodes(laid);
    setTimeout(() => reactFlowInstanceRef.current?.fitView(), 0);
  }, [nodes, edges, setNodes, takeSnapshot]);

  // Suppress lint warning for undoRedoVersion — it's used to trigger re-renders
  void undoRedoVersion;

  const value: BudgetTreeContextValue = {
    nodes: nodes as BokariNode[],
    edges,
    currency,
    setCurrency,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeDataChange,
    getInvestmentConflicts,
    setInvestmentError,
    setNodes,
    setEdges,
    save,
    reset,
    undoAction,
    redoAction,
    canUndo: canUndoFn(undoRedoRef.current),
    canRedo: canRedoFn(undoRedoRef.current),
    exportGraph,
    importGraph,
    takeSnapshot,
    autoLayout,
    setReactFlowInstance,
  };

  return (
    <BudgetTreeContext.Provider value={value}>
      {children}
      <Snackbar
        open={investmentError !== null}
        autoHideDuration={4000}
        onClose={() => setInvestmentError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          variant="filled"
          onClose={() => setInvestmentError(null)}
        >
          {investmentError}
        </Alert>
      </Snackbar>
    </BudgetTreeContext.Provider>
  );
}
