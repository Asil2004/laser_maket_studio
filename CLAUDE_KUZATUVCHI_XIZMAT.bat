@echo off
chcp 65001 >nul
title Claude AI - Orqa Fonda Doimiy Avto-Push Xizmati
echo ========================================================
echo   LaserMaket Studio - Claude AI Doimiy Kuzatuvchi
echo ========================================================
echo.
echo Ushbu oyna ochiq tursa, Claude qaysi faylni saqlasa ham,
echo 3 soniya ichida avtomatik ravishda yangi versiya yaratiladi
echo va to'g'ridan-to'g'ri GitHub omboriga push qilinadi!
echo.
echo To'xtatish uchun: oynani yoping yoki Ctrl + C bosing.
echo.

cd /d "%~dp0"
py auto_sync_claude.py --watch
pause
