// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('versions', {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  ping: () => ipcRenderer.invoke('ping'),
  // we can also expose variables, not just functions
})

contextBridge.exposeInMainWorld('electronAPI', {
  openFile: () => ipcRenderer.invoke('dialog:openFile'),
  readLogData: () => ipcRenderer.invoke('fs:readLogData'),
  clearLogData: () => ipcRenderer.invoke('fs:clearLogData'),
  saveData: (data, one) => ipcRenderer.invoke('saveData', data, one),
  // fetchLogs: (callback) => ipcRenderer.on('fetchLogs', callback),
  fetchLogs: () => ipcRenderer.invoke('fetchLogs'),
})