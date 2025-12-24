
import { useState, useCallback, useRef } from 'react';

/**
 * useHistory - Hook pre správu histórie stavu (Undo/Redo)
 * Umožňuje sledovať zmeny a vracať sa v čase.
 */
export function useHistory<T>(initialState: T) {
  const [state, _setState] = useState<T>(initialState);
  const historyRef = useRef<T[]>([JSON.parse(JSON.stringify(initialState))]);
  const indexRef = useRef(0);

  const setState = useCallback((nextState: T | ((prev: T) => T), saveToHistory = true) => {
    _setState((prev) => {
      const computedState = typeof nextState === 'function' ? (nextState as any)(prev) : nextState;
      
      if (saveToHistory) {
        const newStateCopy = JSON.parse(JSON.stringify(computedState));
        // Odstránime "budúcnosť" ak sme uprostred histórie a robíme novú zmenu
        const newHistory = historyRef.current.slice(0, indexRef.current + 1);
        newHistory.push(newStateCopy);
        
        // Limitujeme históriu na 50 krokov pre výkon
        if (newHistory.length > 50) newHistory.shift();
        
        historyRef.current = newHistory;
        indexRef.current = newHistory.length - 1;
      }
      
      return computedState;
    });
  }, []);

  const undo = useCallback(() => {
    if (indexRef.current > 0) {
      indexRef.current -= 1;
      const prevState = JSON.parse(JSON.stringify(historyRef.current[indexRef.current]));
      _setState(prevState);
    }
  }, []);

  const redo = useCallback(() => {
    if (indexRef.current < historyRef.current.length - 1) {
      indexRef.current += 1;
      const nextState = JSON.parse(JSON.stringify(historyRef.current[indexRef.current]));
      _setState(nextState);
    }
  }, []);

  return {
    state,
    setState,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1
  };
}
