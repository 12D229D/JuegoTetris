const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });
  win.loadFile('dist/index.html');
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC placeholders (will be expanded later)
ipcMain.handle('save-project', async (event, name, sceneJson) => {
  // delegate to backend service
  const { saveProject } = require('./backend/services');
  return await saveProject(name, sceneJson);
});

ipcMain.handle('load-project', async (event, id) => {
  const { loadProject } = require('./backend/services');
  return await loadProject(id);
});

ipcMain.handle('export-scene', async (event, format, sceneData) => {
  const { exportScene } = require('./backend/services');
  return await exportScene(format, sceneData);
});