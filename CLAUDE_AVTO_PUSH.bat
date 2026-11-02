@echo off
chcp 65001 >nul
title Claude AI - Bir Klikda Yangilash va GitHub'ga Push
echo ========================================================
echo   LaserMaket Studio - Claude AI Avtomatik Push
echo ========================================================
echo.
echo Claude yaratgan barcha o'zgarishlar paketlanmoqda,
echo o'rnatilgan dasturlarga ko'chirilmoqda va GitHub'ga yuklanmoqda...
echo.

cd /d "%~dp0"
py auto_sync_claude.py push

echo.
echo ========================================================
echo   Tayyor! Barcha 4 ta kompyuter ilova orqali yangilanadi.
echo ========================================================
pause
