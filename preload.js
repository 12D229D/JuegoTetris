const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  saveProject: (name, sceneJson) => ipcRenderer.invoke('save-project', name, sceneJson),
  loadProject: (id) => ipcRenderer.invoke('load-project', id),
  exportScene: (format, sceneData) => ipcRenderer.invoke('export-scene', format, sceneData),
});