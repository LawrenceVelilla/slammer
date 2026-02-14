const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('slammer', {
  // mode: 'hard' (default, shuts down PC on strike 3) or 'extreme' (deletes root folder)
  executePunishment: (level, mode = 'hard') =>
    ipcRenderer.invoke('execute-punishment', { level, mode }),
})
