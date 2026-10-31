@echo off
title LaserMaket Studio
cd /d "%~dp0LaserMaket_Studio"
start "" http://localhost:3800/tools/ai-erkin-generator.html
node launch_studio.js
pause
