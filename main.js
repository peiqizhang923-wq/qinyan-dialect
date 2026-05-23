const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow = null;
let pythonProc = null;

// ── 启动 Python TTS 服务器 ──────────────────────────────
function startTTSServer() {
    return new Promise((resolve) => {
        try {
            pythonProc = spawn('python', ['tts_server.py'], {
                cwd: __dirname,
                windowsHide: true,
                stdio: ['ignore', 'pipe', 'pipe']
            });

            pythonProc.on('error', () => {
                console.log('[TTS] Python not found — TTS will fallback to Web Speech');
                pythonProc = null;
                resolve(false);
            });

            pythonProc.on('exit', (code) => {
                console.log('[TTS] Python process exited (code ' + code + ')');
                pythonProc = null;
            });

            // 轮询 health 端点等待就绪
            var attempts = 0;
            var maxAttempts = 20; // 10 秒
            var check = setInterval(function () {
                attempts++;
                var req = require('http').get('http://localhost:9880/health', function (res) {
                    if (res.statusCode === 200) {
                        clearInterval(check);
                        console.log('[TTS] Edge-TTS server ready on :9880');
                        resolve(true);
                    }
                });
                req.on('error', function () {
                    if (attempts >= maxAttempts) {
                        clearInterval(check);
                        console.log('[TTS] Server startup timeout — continuing anyway');
                        resolve(false);
                    }
                });
                req.setTimeout(1000, function () {
                    req.destroy();
                });
            }, 500);

        } catch (e) {
            console.log('[TTS] Failed to start: ' + e.message);
            resolve(false);
        }
    });
}

function stopTTSServer() {
    if (pythonProc) {
        pythonProc.kill();
        pythonProc = null;
        console.log('[TTS] Server stopped');
    }
}

// ── 创建主窗口 ──────────────────────────────────────────
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 850,
        minWidth: 960,
        minHeight: 600,
        title: '秦言三韵 · 掌上长安',
        backgroundColor: '#EDE4D3',
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    });

    mainWindow.loadFile('index.html');

    mainWindow.once('ready-to-show', function () {
        mainWindow.show();
    });

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

// ── 应用生命周期 ────────────────────────────────────────
app.whenReady().then(async function () {
    await startTTSServer();
    createWindow();
});

app.on('window-all-closed', function () {
    stopTTSServer();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', function () {
    stopTTSServer();
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
