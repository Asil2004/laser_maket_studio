@echo off
chcp 65001 >nul
echo ========================================================
echo   LaserMaket Studio - Yangilanishni Nashr Qilish (GitHub)
echo ========================================================
echo.
set /p VER="Yangi versiya raqami (masalan: 1.0.81) [bo'sh qoldirilsa avtomatik]: "
set /p NOTES="Yangilanish haqida izoh: "

cd /d "%~dp0"
if "%VER%"=="" (
  node updater.js publish
) else (
  node updater.js publish %VER% "%NOTES%"
)

echo.
echo GitHub omboriga yuklanmoqda (Push)...
cd /d "%~dp0\.."
git add .
if "%NOTES%"=="" (
  git commit -m "LaserMaket Studio yangilanishi"
) else (
  git commit -m "%NOTES%"
)
git push -u origin main

echo.
echo ========================================================
echo   Yangilanish muvaffaqiyatli GitHub'ga yuklandi!
echo   Barcha 4 ta kompyuter dasturni ochganda avtomatik yangilanadi!
echo ========================================================
pause
