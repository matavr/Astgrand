@echo off
chcp 65001 >nul
cd /d "%~dp0"
rundll32 url.dll,FileProtocolHandler "%~dp0index.html"
if errorlevel 1 start "" "%~dp0index.html"
exit
