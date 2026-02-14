const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('slammer', {
  executePunishment: (level) => ipcRenderer.invoke('execute-punishment', level),
})
