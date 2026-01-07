export interface ElectronAPI {
  selectDatDirectory: () => Promise<Array<{ name: string; content: string; path: string }> | null>;
  selectRomListDirectory: () => Promise<Array<{ name: string; content: string; path: string }> | null>;
  selectDatFiles: () => Promise<Array<{ name: string; content: string; path: string }> | null>;
  selectRomListFiles: () => Promise<Array<{ name: string; content: string; path: string }> | null>;
  minimizeWindow: () => Promise<void>;
  maximizeWindow: () => Promise<void>;
  closeWindow: () => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}