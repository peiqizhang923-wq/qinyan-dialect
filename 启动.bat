@echo off
cd /d "%~dp0"

:: 启动语音服务（后台）
start /min "" python "%~dp0tts_server.py"

:: 打开首页
start "" "%~dp0index.html"

exit
