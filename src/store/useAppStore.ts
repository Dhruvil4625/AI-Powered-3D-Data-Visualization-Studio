import { create } from 'zustand';

export type Role = 'user' | 'assistant';

export interface ChatSuggestion {
  type: string;
  title: string;
  description: string;
  action: string;
  actionLabel: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  suggestions?: ChatSuggestion[];
}

export interface ChartConfig {
  type: 'scatter' | 'bar' | 'network' | 'line' | 'surface' | 'none';
  xAxis: string;
  yAxis: string;
  zAxis: string;
  colorAxis?: string;
}

export interface VisualConfig {
  nodeOpacity: number;
  pointScale: number;
  edgeThickness: number;
  cameraMode: 'orbit' | 'firstPerson' | 'axonometric' | 'topDown';
  primaryColor: '#00f5ff' | string;
  secondaryColor: '#ff0055' | string;
}

export interface MLEvaluation {
  status: string;
  reason?: string;
  metric?: string;
  train_score?: number;
  test_score?: number;
  fit_status?: string;
  target_col?: string;
  confusion_matrix?: number[][];
}

export type DataCell = string | number | boolean | null | undefined;
export type DataRow = Record<string, DataCell>;

export interface CleaningStats {
  missing_values?: Record<string, number>;
  duplicates?: number;
  variance?: Record<string, number>;
  warnings?: string[];
  suggestions?: string[];
  [key: string]: unknown;
}

interface AppState {
  data: DataRow[] | null;
  initialData: DataRow[] | null;
  columns: string[];
  initialColumns: string[];
  datasetId: string | null;
  token: string | null;
  cleaningStats: CleaningStats | null;
  initialCleaningStats: CleaningStats | null;
  chatHistory: ChatMessage[];
  chartConfig: ChartConfig;
  visualConfig: VisualConfig;
  isProcessingData: boolean;
  isAiThinking: boolean;
  toastMessage: string | null;
  baselineMl: MLEvaluation | null;
  currentMl: MLEvaluation | null;

  setData: (data: DataRow[], columns: string[], datasetId?: string, cleaningStats?: CleaningStats | null) => void;
  setToken: (token: string | null) => void;
  setCleaningStats: (stats: CleaningStats | null) => void;
  setInitialCleaningStats: (stats: CleaningStats | null) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id'>) => void;
  setChartConfig: (config: Partial<ChartConfig>) => void;
  setVisualConfig: (config: Partial<VisualConfig>) => void;
  setIsProcessingData: (processing: boolean) => void;
  setIsAiThinking: (thinking: boolean) => void;
  setToastMessage: (msg: string | null) => void;
  setBaselineMl: (ml: MLEvaluation | null) => void;
  setCurrentMl: (ml: MLEvaluation | null) => void;
  clearData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  data: null,
  initialData: null,
  columns: [],
  initialColumns: [],
  datasetId: null,
  token: localStorage.getItem('token'),
  cleaningStats: null,
  initialCleaningStats: null,
  chatHistory: [
    { id: '1', role: 'assistant', content: "Hello! I'm your AI data assistant. Upload a dataset to get started, and then you can ask me to visualize it in different ways." }
  ],
  chartConfig: {
    type: 'none',
    xAxis: '',
    yAxis: '',
    zAxis: '',
  },
  visualConfig: {
    nodeOpacity: 0.85,
    pointScale: 1.2,
    edgeThickness: 0.05,
    cameraMode: 'orbit',
    primaryColor: '#00f5ff',
    secondaryColor: '#ff0055',
  },
  isProcessingData: false,
  isAiThinking: false,
  toastMessage: null,
  baselineMl: null,
  currentMl: null,

  setData: (data, columns, datasetId = undefined, cleaningStats = null) => set((state) => {
    // Robustness check: if datasetId is an object (likely cleaningStats passed positionally), 
    // and cleaningStats is null, swap them or ignore the invalid ID.
    let finalId = datasetId;
    let finalStats = cleaningStats;

    if (typeof datasetId === 'object' && datasetId !== null && cleaningStats === null) {
      finalId = undefined;
      finalStats = datasetId;
    }

    return {
      data,
      initialData: finalId !== undefined ? data : state.initialData,
      columns,
      initialColumns: finalId !== undefined ? columns : state.initialColumns,
      datasetId: finalId !== undefined ? (typeof finalId === 'string' ? finalId : state.datasetId) : state.datasetId,
      cleaningStats: finalStats,
      initialCleaningStats: finalId !== undefined ? finalStats : state.initialCleaningStats,
      isProcessingData: false
    };
  }),
  setToken: (token) => {
    if (token) localStorage.setItem('token', token);
    else localStorage.removeItem('token');
    set({ token });
  },
  setCleaningStats: (cleaningStats) => set({ cleaningStats }),
  setInitialCleaningStats: (initialCleaningStats) => set({ initialCleaningStats }),
  addChatMessage: (msg) => set((state) => ({ 
    chatHistory: [...state.chatHistory, { ...msg, id: Math.random().toString(36).substring(7) }] 
  })),
  setChartConfig: (config) => set((state) => ({ 
    chartConfig: { ...state.chartConfig, ...config } 
  })),
  setVisualConfig: (config) => set((state) => ({
    visualConfig: { ...state.visualConfig, ...config }
  })),
  setIsProcessingData: (isProcessingData) => set({ isProcessingData }),
  setIsAiThinking: (isAiThinking) => set({ isAiThinking }),
  setToastMessage: (toastMessage) => set({ toastMessage }),
  setBaselineMl: (baselineMl) => set({ baselineMl }),
  setCurrentMl: (currentMl) => set({ currentMl }),
  clearData: () => set({ data: null, initialData: null, columns: [], initialColumns: [], datasetId: null, cleaningStats: null, initialCleaningStats: null, chartConfig: { type: 'none', xAxis: '', yAxis: '', zAxis: '' }, baselineMl: null, currentMl: null })
}));
