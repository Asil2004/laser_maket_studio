@echo off
chcp 65001 >nul
echo ========================================================
echo   LaserMaket Studio - Boshqa Kompyuterni Sozlash (Client)
echo ========================================================
echo.
echo Bu skript ushbu kompyuterdagi LaserMaket Studio dasturini
echo Asil2004 GitHub bulutiga ulaydi.
echo.

set TARGET_APP=%LOCALAPPDATA%\Programs\LaserMaket Studio\resources\app
if not exist "%LOCALAPPDATA%\Programs\LaserMaket Studio" (
  echo [OGOHLANTIRISH]: LaserMaket Studio o'rnatilmagan ko'rinadi!
  echo Iltimos, avval LaserMaket Studio o'rnatilganligini tekshiring.
  pause
  exit /b 1
)

if not exist "%TARGET_APP%" (
  mkdir "%TARGET_APP%"
)

echo Sozlash fayllari ko'chirilmoqda...
copy /y "%~dp0LaserMaket_Studio\updater.js" "%TARGET_APP%\updater.js" >nul
copy /y "%~dp0LaserMaket_Studio\updater-config.json" "%TARGET_APP%\updater-config.json" >nul

echo.
echo Internetdan (GitHub) so'nggi yangilanishlar yuklanmoqda...
cd /d "%TARGET_APP%"
node "%TARGET_APP%\updater.js" internet

echo.
echo ========================================================
echo   Ushbu kompyuter muvaffaqiyatli ulandi!
echo   Endi dastur har safar ochilganda GitHub'dan avtomatik yangilanadi.
echo ========================================================
pause
