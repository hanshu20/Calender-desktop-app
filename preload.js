const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  notify: (payload) => ipcRenderer.invoke('notify', payload)
});
