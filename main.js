import path from 'path'
import { fileURLToPath } from 'url'
import { exec, execSync } from 'child_process'
import fs from 'fs'
import os from 'os'
import { app, BrowserWindow, ipcMain } from 'electron'

const __dirname = path.dirname(fileURLToPath(import.meta.url))


const isDev = !app.isPackaged

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.cjs'),
        }
    })

    if (isDev) {
        win.loadURL('http://localhost:5173')
    } else {
        win.loadFile(path.join(__dirname, 'client', 'dist', 'index.html'))
    }
}

/* ── Punishment Handlers ── */

// Write AppleScript to a temp file and execute it (avoids shell quoting hell)
function runAppleScript(script) {
    const tmpFile = path.join(os.tmpdir(), 'slammer-punishment.scpt')
    fs.writeFileSync(tmpFile, script)
    return execSync(`osascript "${tmpFile}"`).toString().trim()
}

function runAppleScriptAsync(script) {
    const tmpFile = path.join(os.tmpdir(), 'slammer-punishment.scpt')
    fs.writeFileSync(tmpFile, script)
    exec(`osascript "${tmpFile}"`)
}

const BROWSERS = ["Google Chrome", "Safari", "Firefox", "Brave Browser", "Arc", "Microsoft Edge"]

function areBrowsersOpen() {
    try {
        if (process.platform === 'darwin') {
            const browserChecks = BROWSERS.map(b => `"${b}"`).join(', ')
            const result = runAppleScript(`
tell application "System Events"
    set found to false
    set browserList to {${browserChecks}}
    set runningApps to name of every application process
    repeat with browserName in browserList
        if runningApps contains browserName then
            set found to true
        end if
    end repeat
    return found
end tell
`)
            return result === 'true'
        } else if (process.platform === 'win32') {
            const result = execSync(
                'tasklist /FI "IMAGENAME eq chrome.exe" /FI "IMAGENAME eq firefox.exe" /FI "IMAGENAME eq msedge.exe" /FI "IMAGENAME eq brave.exe" 2>nul'
            ).toString()
            return result.includes('chrome.exe') || result.includes('firefox.exe') || result.includes('msedge.exe') || result.includes('brave.exe')
        }
    } catch {
        return false
    }
    return false
}

function closeBrowserTabs() {
    if (process.platform === 'darwin') {
        const browserChecks = BROWSERS.map(b => `"${b}"`).join(', ')
        runAppleScriptAsync(`
set browserList to {${browserChecks}}
tell application "System Events"
    set runningApps to name of every application process
end tell
repeat with browserName in browserList
    set bName to contents of browserName
    if runningApps contains bName then
        try
            tell application bName to close every window
        end try
    end if
end repeat
`)
    } else if (process.platform === 'win32') {
        exec('taskkill /F /IM chrome.exe /IM firefox.exe /IM msedge.exe /IM brave.exe 2>nul', () => { })
    }
}

function blastLoudSound() {
    // Max out system volume
    if (process.platform === 'darwin') {
        exec('osascript -e "set volume output volume 100"')
    } else if (process.platform === 'win32') {
        // Set volume to max via PowerShell
        exec('powershell -command "(New-Object -ComObject WScript.Shell).SendKeys([char]175)" ', () => { })
    }
}

function closeAllWindows() {
    if (process.platform === 'darwin') {
        runAppleScriptAsync(`
tell application "System Events"
    set appList to name of every application process whose visible is true
end tell
repeat with appName in appList
    set aName to contents of appName
    if aName is not "Finder" and aName is not "Electron" and aName is not "slammer" then
        try
            tell application aName to quit
        end try
    end if
end repeat
`)
    } else if (process.platform === 'win32') {
        const ps = 'Get-Process | Where-Object {$_.MainWindowTitle -ne "" -and $_.ProcessName -ne "explorer" -and $_.ProcessName -ne "electron"} | Stop-Process -Force'
        exec(`powershell -command "${ps}"`, () => { })
    }
}

ipcMain.handle('execute-punishment', async (_event, level) => {
    switch (level) {
        case 1: {
            const browsersOpen = areBrowsersOpen()
            if (browsersOpen) {
                closeBrowserTabs()
                return { executed: true, punishment: 'browser-tabs-closed' }
            } else {
                blastLoudSound()
                return { executed: true, punishment: 'loud-sound' }
            }
        }
        case 2:
            closeAllWindows()
            return { executed: true, punishment: 'all-windows-closed' }
        case 3:
            // TBD - extreme punishment
            return { executed: true, punishment: 'TBD' }
        default:
            return { executed: false }
    }
})

/* ── App Lifecycle ── */

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
