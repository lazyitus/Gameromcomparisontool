import { contextBridge, ipcRenderer } from 'electron';

console.log('🔧 Preload script is running!');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Select DAT directory and return all .dat/.xml files
  selectDatDirectory: () => ipcRenderer.invoke('select-dat-directory'),
  
  // Select ROM list directory and return all .txt files
  selectRomListDirectory: () => ipcRenderer.invoke('select-romlist-directory'),
  
  // Select individual DAT files
  selectDatFiles: () => ipcRenderer.invoke('select-dat-files'),
  
  // Select individual ROM list files
  selectRomListFiles: () => ipcRenderer.invoke('select-romlist-files'),
  
  // Window controls
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
});

console.log('✅ electronAPI exposed to window object');