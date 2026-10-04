const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  printReceipt: (options) => ipcRenderer.invoke('print-receipt', options),
  minimizeWindow: () => ipcRenderer.send('window-minimize'),
  maximizeWindow: () => ipcRenderer.send('window-maximize'),
  closeWindow: () => ipcRenderer.send('window-close'),
  saveBackupFile: (data, defaultFilename) => ipcRenderer.invoke('save-backup-file', { data, defaultFilename }),
  loadBackupFile: () => ipcRenderer.invoke('load-backup-file')
});
