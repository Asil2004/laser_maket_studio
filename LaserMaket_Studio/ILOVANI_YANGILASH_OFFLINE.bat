@echo off
chcp 65001 >nul
echo ========================================================
echo   LaserMaket Studio - O'rnatilgan Ilovani Yangilash
echo ========================================================
echo.
cd /d "%~dp0"
node updater.js

echo.
echo ========================================================
echo   LaserMaket Studio ilovasi yangilandi!
echo ========================================================
pause
