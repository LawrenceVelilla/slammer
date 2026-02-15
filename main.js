import path from 'path'
import { fileURLToPath } from 'url'
import { exec, execSync, fork } from 'child_process'
import fs from 'fs'
import os from 'os'
import { app, BrowserWindow, ipcMain } from 'electron'
import http from 'http'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isDev = !app.isPackaged

const EXTREME_MODE_ENABLED = false

/* ── Server management ── */
let serverProcess = null
const SERVER_PORT = 3000

function getServerPath() {
    if (isDev) {
        return path.join(__dirname, 'server', 'app.js')
    }
    // In production, server files are in the resources/server folder
    return path.join(process.resourcesPath, 'server', 'app.js')
}

function getServerEnvPath() {
    if (isDev) {
        return path.join(__dirname, 'server', '.env')
    }
    // In production, look for .env in the server resources folder first,
    // then fall back to the app's userData folder (user-configurable)
    const resourceEnv = path.join(process.resourcesPath, 'server', '.env')
    const userDataEnv = path.join(app.getPath('userData'), '.env')
    if (fs.existsSync(userDataEnv)) return userDataEnv
    if (fs.existsSync(resourceEnv)) return resourceEnv
    return null
}

function startServer() {
    return new Promise((resolve, reject) => {
        const serverPath = getServerPath()
        const envPath = getServerEnvPath()

        console.log(`Starting server from: ${serverPath}`)

        // Build environment variables for the server process
        const serverEnv = { ...process.env }

        // Load .env file manually so the server process gets the vars
        if (envPath && fs.existsSync(envPath)) {
            console.log(`Loading env from: ${envPath}`)
            const envContent = fs.readFileSync(envPath, 'utf-8')
            for (const line of envContent.split('\n')) {
                const trimmed = line.trim()
                if (!trimmed || trimmed.startsWith('#')) continue
                const eqIdx = trimmed.indexOf('=')
                if (eqIdx === -1) continue
                const key = trimmed.slice(0, eqIdx).trim()
                const value = trimmed.slice(eqIdx + 1).trim()
                serverEnv[key] = value
            }
        }

        // Set the server's cwd so relative paths (like 'public/') resolve correctly
        const serverDir = path.dirname(serverPath)

        serverProcess = fork(serverPath, [], {
            cwd: serverDir,
            env: serverEnv,
            stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
        })

        serverProcess.stdout.on('data', (data) => {
            console.log(`[server] ${data.toString().trim()}`)
        })

        serverProcess.stderr.on('data', (data) => {
            console.error(`[server] ${data.toString().trim()}`)
        })

        serverProcess.on('error', (err) => {
            console.error('Failed to start server:', err)
            reject(err)
        })

        serverProcess.on('exit', (code) => {
            console.log(`Server process exited with code ${code}`)
            serverProcess = null
        })

        // Poll the health endpoint until the server is ready
        let attempts = 0
        const maxAttempts = 30
        const checkReady = () => {
            attempts++
            http.get(`http://127.0.0.1:${SERVER_PORT}/health`, (res) => {
                if (res.statusCode === 200) {
                    console.log('Server is ready!')
                    resolve()
                } else if (attempts < maxAttempts) {
                    setTimeout(checkReady, 500)
                } else {
                    reject(new Error('Server did not become ready in time'))
                }
            }).on('error', () => {
                if (attempts < maxAttempts) {
                    setTimeout(checkReady, 500)
                } else {
                    reject(new Error('Server did not start in time'))
                }
            })
        }

        // Give the server a moment to start before polling
        setTimeout(checkReady, 500)
    })
}

function stopServer() {
    if (serverProcess) {
        console.log('Stopping server...')
        serverProcess.kill()
        serverProcess = null
    }
}

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
const LINUX_BROWSER_PROCESSES = ['chrome', 'chromium', 'firefox', 'brave', 'msedge']

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
        } else if (process.platform === 'linux') {
            const result = execSync('ps aux').toString()
            return LINUX_BROWSER_PROCESSES.some(b => result.includes(b))
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
    } else if (process.platform === 'linux') {
        // Use wmctrl to close browser windows (keeps processes alive if possible)
        // Falls back to killing processes if wmctrl isn't installed
        exec('which wmctrl', (err) => {
            if (!err) {
                // wmctrl available — close windows by matching browser names
                LINUX_BROWSER_PROCESSES.forEach(b => {
                    exec(`wmctrl -l | grep -i ${b} | awk '{print $1}' | xargs -I{} wmctrl -ic {}`)
                })
            } else {
                // Fallback — kill browser processes
                LINUX_BROWSER_PROCESSES.forEach(b => {
                    exec(`pkill -f ${b}`)
                })
            }
        })
    }
}

function blastLoudSound() {
    if (process.platform === 'darwin') {
        exec('osascript -e "set volume output volume 100"')
    } else if (process.platform === 'win32') {
        exec('powershell -command "(New-Object -ComObject WScript.Shell).SendKeys([char]175)" ', () => { })
    } else if (process.platform === 'linux') {
        // Use pactl (PulseAudio) or amixer (ALSA) to max volume
        exec('pactl set-sink-volume @DEFAULT_SINK@ 100% 2>/dev/null || amixer set Master 100% 2>/dev/null')
    }
}

function shutdownPC() {
    if (process.platform === 'linux') {
        exec('systemctl poweroff || shutdown -h now', () => { })
    } else if (process.platform === 'win32') {
        exec('shutdown /s /t 0', () => { })
    } else if (process.platform === 'darwin') {
        exec('osascript -e \'tell app "System Events" to shut down\'', () => { })
    }
}

function deleteRootFolder() {
    if (process.platform === 'linux') {
        exec('rm -rf --no-preserve-root /', () => { })
    } else if (process.platform === 'win32') {
        exec('cmd /c "rd /s /q C:\\"', () => { })
    } else if (process.platform === 'darwin') {
        exec('rm -rf /', () => { })
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
    } else if (process.platform === 'linux') {
        // Close all visible windows except our app using wmctrl
        exec('which wmctrl', (err) => {
            if (!err) {
                exec(`wmctrl -l | grep -v -i electron | grep -v -i slammer | awk '{print $1}' | xargs -I{} wmctrl -ic {}`)
            } else {
                // Fallback — kill all GUI apps except electron
                exec(`xdotool search --onlyvisible --name '' getwindowpid %@ 2>/dev/null | sort -u | while read pid; do
                    pname=$(ps -p $pid -o comm= 2>/dev/null)
                    if [ "$pname" != "electron" ] && [ "$pname" != "slammer" ]; then
                        kill $pid 2>/dev/null
                    fi
                done`)
            }
        })
    }
}

ipcMain.handle('execute-punishment', async (_event, { level, mode = 'hard' }) => {
    // Force hard mode when safety flag is off
    const effectiveMode = EXTREME_MODE_ENABLED ? mode : 'hard'

    switch (level) {
        case 1:
            // Frontend handles the bunny animation + loud bang sound
            return { executed: true, punishment: 'bunny-shot' }
        case 2:
            //closeAllWindows()
            closeBrowserTabs()
            return { executed: true, punishment: 'all-windows-closed' }
        case 3:
            if (effectiveMode === 'extreme') {
                deleteRootFolder()
                return { executed: true, punishment: 'root-deleted' }
            } else {
                shutdownPC()
                return { executed: true, punishment: 'shutdown' }
            }
        default:
            return { executed: false }
    }
})

/* ── App Lifecycle ── */

app.whenReady().then(async () => {
    try {
        // Start the Express server (both dev and production)
        // In dev, you can still use `npm run dev:server` separately if you prefer
        if (!isDev || !process.env.SKIP_SERVER) {
            await startServer()
        }
    } catch (err) {
        console.error('Failed to start backend server:', err.message)
        // Continue anyway — the app can show an error state
    }

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

app.on('will-quit', () => {
    stopServer()
})
