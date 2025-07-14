'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { MLCEngine, InitProgressReport, prebuiltAppConfig, ModelRecord, MLCEngineConfig } from '@mlc-ai/web-llm';

interface AIContextType {
  engine: MLCEngine | null;
  availableModels: ModelRecord[];
  isReady: boolean;
  isLoading: boolean;
  progress: InitProgressReport;
  loadModel: (modelId: string) => Promise<void>;
  reset: () => void;
}

const AIContext = createContext<AIContextType | null>(null);

export const AIProvider = ({ children }: PropsWithChildren) => {
  const engineRef = useRef<MLCEngine | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<InitProgressReport>({
    progress: 0,
    timeElapsed: 0,
    text: 'Initializing AI Engine...',
  });

  const availableModels = prebuiltAppConfig.model_list;

  useEffect(() => {
    if (typeof window !== 'undefined' && !engineRef.current) {
      const worker = new Worker('/web-llm.worker.js') as MLCEngineConfig;

      engineRef.current = new MLCEngine(worker);

      engineRef.current.setInitProgressCallback((report: InitProgressReport) => {
        setProgress(report);
      });
    }
  }, []);

  const loadModel = useCallback(
    async (modelId: string) => {
      if (isLoading || !engineRef.current) return;
      setIsLoading(true);
      setIsReady(false);

      console.time('model_load_time');
      await engineRef.current.reload(modelId);
      console.timeEnd('model_load_time');

      setIsLoading(false);
      setIsReady(true);
    },
    [isLoading],
  );

  const reset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.unload();
      setIsReady(false);
      setProgress({
        progress: 0,
        timeElapsed: 0,
        text: 'Engine reset. Ready to load a new model.',
      });
    }
  }, []);

  const value: AIContextType = {
    engine: engineRef.current,
    availableModels,
    isReady,
    isLoading,
    progress,
    loadModel,
    reset,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
