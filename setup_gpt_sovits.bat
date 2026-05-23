@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ================================================
echo   秦言三韵 · GPT-SoVITS 安装脚本
echo   陕西地域方言真人语音克隆
echo ================================================
echo.

:: ── 1. 检查环境 ──────────────────────────────
echo [检查 1/2] Python ...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [X] 未找到 Python，请先安装 Python 3.10+
    echo       下载: https://www.python.org/downloads/
    echo       安装时务必勾选 "Add Python to PATH"
    pause
    exit /b 1
)
python --version
echo   [OK]

echo [检查 2/2] Git ...
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   [X] 未找到 Git
    echo       下载: https://git-scm.com/download/win
    pause
    exit /b 1
)
git --version
echo   [OK]
echo.

:: ── 2. 克隆 GPT-SoVITS ───────────────────────
set "WORK_DIR=%~dp0GPT-SoVITS"

if exist "%WORK_DIR%" (
    echo [跳过] GPT-SoVITS 目录已存在: %WORK_DIR%
    cd /d "%WORK_DIR%"
) else (
    echo [步骤 1/3] 克隆 GPT-SoVITS 仓库...
    echo   目标: %WORK_DIR%
    echo.

    :: 先尝试直接克隆
    git clone https://github.com/RVC-Boss/GPT-SoVITS.git "%WORK_DIR%" 2>&1

    if %errorlevel% neq 0 (
        echo.
        echo   [X] 直连 GitHub 失败，尝试国内镜像 ghproxy ...
        :: 如果已经有失败的目录，删掉
        if exist "%WORK_DIR%" rmdir /s /q "%WORK_DIR%"
        git clone https://ghproxy.net/https://github.com/RVC-Boss/GPT-SoVITS.git "%WORK_DIR%" 2>&1

        if %errorlevel% neq 0 (
            if exist "%WORK_DIR%" rmdir /s /q "%WORK_DIR%"
            echo   [X] ghproxy 也失败，尝试镜像2 (gitclone.com) ...
            git clone https://gitclone.com/github.com/RVC-Boss/GPT-SoVITS.git "%WORK_DIR%" 2>&1
        )

        if %errorlevel% neq 0 (
            echo.
            echo   ============================================
            echo   [X] 所有镜像都无法克隆，请手动操作：
            echo   1. 打开 https://gitcode.com/RVC-Boss/GPT-SoVITS
            echo   2. 下载 ZIP 并解压到:
            echo      %WORK_DIR%
            echo   ============================================
            pause
            exit /b 1
        )
    )
    cd /d "%WORK_DIR%"
    echo   [OK] 克隆完成
)
echo.

:: ── 3. 安装依赖 ─────────────────────────────
echo [步骤 2/3] 安装 Python 依赖（需要 3~10 分钟）...

:: 基础深度学习框架（CPU 版，如需 GPU 加速可改为 cu118/cu126）
echo.
echo   安装 PyTorch（CPU 版，约 200MB）...
pip install torch torchaudio --quiet 2>&1
if %errorlevel% neq 0 (
    echo   [X] PyTorch 安装失败，可能是网络问题
    echo   请手动执行: pip install torch torchaudio
    pause
    exit /b 1
)

echo   安装 GPT-SoVITS 依赖...
pip install -r requirements.txt --quiet 2>&1
if %errorlevel% neq 0 (
    echo   [!] 部分依赖安装失败，尝试继续...
)

echo   安装额外依赖...
pip install fastapi uvicorn soundfile librosa huggingface_hub --quiet 2>&1
if %errorlevel% neq 0 (
    echo   [!] 额外依赖安装失败，尝试继续...
)
echo   [OK]
echo.

:: ── 4. 下载预训练模型 ────────────────────
echo [步骤 3/3] 下载预训练模型（约 2GB，需要几分钟）...
echo.

set "MODEL_DIR=%WORK_DIR%\GPT_SoVITS\pretrained_models"

:: 检查模型是否已存在
if exist "%MODEL_DIR%\gsv-v2final-pretrained\*" (
    echo   [跳过] 预训练模型已存在: %MODEL_DIR%
) else (
    echo   调用下载脚本...
    echo   ----------------------------------------
    python "%~dp0download_models.py"
    if %errorlevel% neq 0 (
        echo.
        echo   [X] 模型下载失败，请按上面提示手动下载
        echo   然后重新运行这个脚本即可跳过此步骤
        pause
        exit /b 1
    )
    echo   ----------------------------------------
)
echo.

:: ── 创建参考音频目录 ─────────────────────
set "REF_DIR=%~dp0ref_audio"
if not exist "%REF_DIR%" mkdir "%REF_DIR%"

echo ================================================
echo   安装完成！
echo ================================================
echo.
echo 📁 目录结构：
echo   %~dp0
echo   ├── 秦言三韵.html      （方言文创网页）
echo   ├── ref_audio\          （放你的方言真人录音）
echo   │   ├── guanzhong.wav   （关中话，3~10秒）
echo   │   ├── shanbei.wav     （陕北话，3~10秒）
echo   │   ├── shannan.wav     （陕南话，3~10秒）
echo   │   └── classical.wav   （古雅言，3~10秒）
echo   └── GPT-SoVITS\         （语音克隆引擎）
echo.
echo ════════════════════════════════════════════════
echo   接下来的步骤：
echo ════════════════════════════════════════════════
echo.
echo   1. 准备 4 段方言录音（手机录也行，WAV格式，3~10秒）
echo      放到 ref_audio\ 目录
echo.
echo   2. 启动 GPT-SoVITS API 服务：
echo      cd GPT-SoVITS
echo      python api_v2.py
echo      （看到 "Uvicorn running on http://0.0.0.0:9880" 就成功了）
echo.
echo   3. 双击打开 秦言三韵.html
echo      在底部切换到 GPT-SoVITS，点击「🔍 检测服务状态」
echo      显示绿灯后即可使用！
echo.
echo ════════════════════════════════════════════════
pause
