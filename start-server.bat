@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ===================================================
echo   Локальный сервер для сайта АСТ «GranD»
echo ===================================================
echo Сервер запущен на http://localhost:8080
start "" "http://localhost:8080"
python -m http.server 8080
pause
