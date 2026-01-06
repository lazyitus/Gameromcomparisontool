export interface ElectronAPI {
  selectDatDirectory: () => Promise<Array<{ name: string; content: string; path: string }> | null>;
  selectRomListDirectory: () => Promise<Array<{ name: string; content: string; path: string }> | null>;
  selectDatFiles: () => Promise<Array<{ name: string; content: string; path: string }> | null>;
  selectRomListFiles: () => Promise<Array<{ name: string; content: string; path: string }> | null>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
