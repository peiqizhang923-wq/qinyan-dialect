const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let mainWindow = null;
let pythonProc = null;  // TTS server
let dbProc = null;      // DB server

// ── 启动 Python 子服务 ──────────────────────────────
function startPythonServer(script, port, label) {
    return new Promise((resolve) => {
        try {
            const proc = spawn('python', [script], {
                cwd: __dirname,
                windowsHide: true,
                stdio: ['ignore', 'pipe', 'pipe']
            });

            proc.on('error', () => {
                console.log('[' + label + '] Python not found');
                resolve(null);
            });

            proc.on('exit', (code) => {
                console.log('[' + label + '] Process exited (code ' + code + ')');
            });

            // 轮询 health 端点
            var attempts = 0;
            var maxAttempts = 20;
            var check = setInterval(function () {
                attempts++;
                var req = require('http').get('http://localhost:' + port + '/health', function (res) {
                    if (res.statusCode === 200) {
                        clearInterval(check);
                        console.log('[' + label + '] Ready on :' + port);
                        resolve(proc);
                    }
                });
                req.on('error', function () {
                    if (attempts >= maxAttempts) {
                        clearInterval(check);
                        console.log('[' + label + '] Startup timeout — continuing');
                        resolve(proc);
                    }
                });
                req.setTimeout(1000, function () { req.destroy(); });
            }, 500);

        } catch (e) {
            console.log('[' + label + '] Failed: ' + e.message);
            resolve(null);
        }
    });
}

function stopPythonServer(proc, label) {
    if (proc) {
        proc.kill();
        console.log('[' + label + '] Stopped');
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
    // 数据库服务（端口9881）
    dbProc = await startPythonServer('db_server.py', 9881, 'DB');
    // TTS语音服务（端口9880）
    pythonProc = await startPythonServer('tts_server.py', 9880, 'TTS');
    createWindow();
});

app.on('window-all-closed', function () {
    stopPythonServer(pythonProc, 'TTS');
    stopPythonServer(dbProc, 'DB');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('before-quit', function () {
    stopPythonServer(pythonProc, 'TTS');
    stopPythonServer(dbProc, 'DB');
});

app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
