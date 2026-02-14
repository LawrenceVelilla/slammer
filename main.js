const { app, BrowserWindow } = require('electron/main')
const path = require('path')

const isDev = !app.isPackaged

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true
        }
    })

    if (isDev) {
        win.loadURL('http://localhost:5173')
    } else {
        win.loadFile(path.join(__dirname, 'client', 'dist', 'index.html'))
    }
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
