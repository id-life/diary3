'use client';

import { createContext, PropsWithChildren, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  MLCEngineInterface,
  InitProgressReport,
  prebuiltAppConfig,
  ModelRecord,
  CreateWebWorkerMLCEngine,
} from '@mlc-ai/web-llm';
import { toast } from 'react-toastify';

interface AIContextType {
  engine: MLCEngineInterface | null;
  availableModels: ModelRecord[];
  isReady: boolean;
  isLoading: boolean;
  progress: InitProgressReport;
  loadModel: (modelId: string) => Promise<void>;
  reset: () => void;
}

const AIContext = createContext<AIContextType | null>(null);

export const AIProvider = ({ children }: PropsWithChildren) => {
  const engineRef = useRef<MLCEngineInterface | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<InitProgressReport>({
    progress: 0,
    timeElapsed: 0,
    text: 'Initializing AI Engine...',
  });

  const availableModels = prebuiltAppConfig.model_list;

  const initAndLoadModel = useCallback(
    async (modelId: string) => {
      if (isLoading) return;
      setIsLoading(true);
      setIsReady(false);

      try {
        const engine = await CreateWebWorkerMLCEngine(
          new Worker(new URL('../worker.ts', import.meta.url), {
            type: 'module',
          }),
          modelId,
          {
            initProgressCallback: (report) => {
              console.log(`AIProvider Progress: ${report.text} (${(report.progress * 100).toFixed(2)}%)`);
              setProgress(report);
            },
          },
        );

        engineRef.current = engine;
        setIsLoading(false);
        setIsReady(true);
        console.log('AIProvider: The engine has been successfully loaded.');
      } catch (error) {
        console.error('Model loading failed:', error);
        setProgress({ progress: 1, timeElapsed: 0, text: `Error: ${error}` });
        setIsLoading(false);
        setIsReady(false);
      }
    },
    [isLoading],
  );

  const loadModel = useCallback(
    async (modelId: string) => {
      if (!engineRef.current) {
        await initAndLoadModel(modelId);
      } else {
        console.log('AIProvider: Engine already exists, calling reload.');
        await engineRef.current.reload(modelId);
      }
    },
    [initAndLoadModel],
  );

  const reset = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.unload();
      engineRef.current = null;
      setIsReady(false);
      setProgress({ progress: 0, timeElapsed: 0, text: 'The engine has been reset and is ready to load new models.' });
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
    throw new Error('useAI 必须在 AIProvider 内部使用');
  }
  return context;
};
