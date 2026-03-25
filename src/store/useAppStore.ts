import { create } from 'zustand';

export type Role = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
}

export interface ChartConfig {
  type: 'scatter' | 'bar' | 'network' | 'none';
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
  primaryColor: string;
  secondaryColor: string;
}

interface AppState {
  data: any[] | null;
  columns: string[];
  chatHistory: ChatMessage[];
  chartConfig: ChartConfig;
  visualConfig: VisualConfig;
  isProcessingData: boolean;
  isAiThinking: boolean;
  toastMessage: string | null;

  setData: (data: any[], columns: string[]) => void;
  addChatMessage: (msg: Omit<ChatMessage, 'id'>) => void;
  setChartConfig: (config: Partial<ChartConfig>) => void;
  setVisualConfig: (config: Partial<VisualConfig>) => void;
  setIsProcessingData: (processing: boolean) => void;
  setIsAiThinking: (thinking: boolean) => void;
  setToastMessage: (msg: string | null) => void;
  clearData: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  data: null,
  columns: [],
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

  setData: (data, columns) => set({ data, columns, isProcessingData: false }),
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
  clearData: () => set({ data: null, columns: [], chartConfig: { type: 'none', xAxis: '', yAxis: '', zAxis: '' } })
}));
