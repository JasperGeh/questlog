import { useState, useCallback } from 'react';

export interface Action {
  type: 'add' | 'delete' | 'update' | 'complete' | 'uncomplete' | 'clear_completed';
  data: any;
  timestamp: number;
}

interface UndoRedoState {
  past: Action[];
  future: Action[];
}

export function useUndoRedo() {
  const [state, setState] = useState<UndoRedoState>({
    past: [],
    future: [],
  });

  const addAction = useCallback((action: Action) => {
    setState(prev => ({
      past: [...prev.past, action],
      future: [], // Clear future when new action is performed
    }));
  }, []);

  const undo = useCallback((): Action | null => {
    if (state.past.length === 0) return null;

    const actionToUndo = state.past[state.past.length - 1];
    setState(prev => ({
      past: prev.past.slice(0, -1),
      future: [actionToUndo, ...prev.future],
    }));

    return actionToUndo;
  }, [state.past]);

  const redo = useCallback((): Action | null => {
    if (state.future.length === 0) return null;

    const actionToRedo = state.future[0];
    setState(prev => ({
      past: [...prev.past, actionToRedo],
      future: prev.future.slice(1),
    }));

    return actionToRedo;
  }, [state.future]);

  const canUndo = state.past.length > 0;
  const canRedo = state.future.length > 0;

  const clear = useCallback(() => {
    setState({
      past: [],
      future: [],
    });
  }, []);

  return {
    addAction,
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
}
