@echo off
cd /d "%~dp0"

:: 启动数据库服务（后台，端口9881）
start /min "" python "%~dp0db_server.py"

:: 启动语音服务（后台，端口9880）
start /min "" python "%~dp0tts_server.py"

:: 等待服务就绪
timeout /t 2 /nobreak >nul

:: 打开首页
start "" "%~dp0index.html"

exit
