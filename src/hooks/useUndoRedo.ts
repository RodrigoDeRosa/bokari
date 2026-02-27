import type { BokariNode, BokariEdge } from '../types';

export interface BudgetTreeSnapshot {
  nodes: BokariNode[];
  edges: BokariEdge[];
  currency: string;
}

export interface UndoRedoState {
  past: BudgetTreeSnapshot[];
  present: BudgetTreeSnapshot;
  future: BudgetTreeSnapshot[];
}

export function createUndoRedoState(initial: BudgetTreeSnapshot): UndoRedoState {
  return {
    past: [],
    present: initial,
    future: [],
  };
}

export function pushSnapshot(state: UndoRedoState, snapshot: BudgetTreeSnapshot): UndoRedoState {
  return {
    past: [...state.past.slice(-49), state.present],
    present: snapshot,
    future: [],
  };
}

export function undo(state: UndoRedoState): UndoRedoState {
  if (state.past.length === 0) return state;

  const previous = state.past[state.past.length - 1];
  return {
    past: state.past.slice(0, -1),
    present: previous,
    future: [state.present, ...state.future],
  };
}

export function redo(state: UndoRedoState): UndoRedoState {
  if (state.future.length === 0) return state;

  const next = state.future[0];
  return {
    past: [...state.past, state.present],
    present: next,
    future: state.future.slice(1),
  };
}

export function canUndo(state: UndoRedoState): boolean {
  return state.past.length > 0;
}

export function canRedo(state: UndoRedoState): boolean {
  return state.future.length > 0;
}
