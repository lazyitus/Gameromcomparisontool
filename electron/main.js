import { app, BrowserWindow, ipcMain, dialog, Menu } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#0a0a0a',
    show: false,
    autoHideMenuBar: true, // Hide menu bar by default
  });

  // Remove the menu bar completely
  Menu.setApplicationMenu(null);

  // Load the app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Select DAT files directory
ipcMain.handle('select-dat-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select DAT Files Directory',
  });

  if (result.canceled) {
    return null;
  }

  const dirPath = result.filePaths[0];
  const files = await fs.readdir(dirPath);
  
  // Filter for .dat and .xml files
  const datFiles = files.filter(file => 
    file.toLowerCase().endsWith('.dat') || file.toLowerCase().endsWith('.xml')
  );

  // Read all DAT files
  const datFileContents = await Promise.all(
    datFiles.map(async (filename) => {
      const content = await fs.readFile(join(dirPath, filename), 'utf-8');
      return {
        name: filename,
        content,
        path: join(dirPath, filename),
      };
    })
  );

  return datFileContents;
});

// Select ROM list files directory
ipcMain.handle('select-romlist-directory', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select ROM Lists Directory',
  });

  if (result.canceled) {
    return null;
  }

  const dirPath = result.filePaths[0];
  const files = await fs.readdir(dirPath);
  
  // Filter for .txt files
  const txtFiles = files.filter(file => file.toLowerCase().endsWith('.txt'));

  // Read all text files
  const romListContents = await Promise.all(
    txtFiles.map(async (filename) => {
      const content = await fs.readFile(join(dirPath, filename), 'utf-8');
      return {
        name: filename,
        content,
        path: join(dirPath, filename),
      };
    })
  );

  return romListContents;
});

// Select individual DAT files
ipcMain.handle('select-dat-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: 'Select DAT Files',
    filters: [
      { name: 'DAT Files', extensions: ['dat', 'xml'] },
      { name: 'All Files', extensions: ['*'] }
    ],
  });

  if (result.canceled) {
    return null;
  }

  // Read all selected files
  const fileContents = await Promise.all(
    result.filePaths.map(async (filePath) => {
      const content = await fs.readFile(filePath, 'utf-8');
      const filename = filePath.split(/[\\/]/).pop();
      return {
        name: filename,
        content,
        path: filePath,
      };
    })
  );

  return fileContents;
});

// Select individual ROM list files
ipcMain.handle('select-romlist-files', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile', 'multiSelections'],
    title: 'Select ROM List Files',
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ],
  });

  if (result.canceled) {
    return null;
  }

  // Read all selected files
  const fileContents = await Promise.all(
    result.filePaths.map(async (filePath) => {
      const content = await fs.readFile(filePath, 'utf-8');
      const filename = filePath.split(/[\\/]/).pop();
      return {
        name: filename,
        content,
        path: filePath,
      };
    })
  );

  return fileContents;
});