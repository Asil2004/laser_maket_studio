@echo off
chcp 65001 >nul
echo ======================================================================
echo    LaserMaket Studio - Boshqa Kompyuterlarni Avto-Yangilashga Ulash
echo ======================================================================
echo.
echo Ushbu skript kompyuteringizdagi LaserMaket Studio ilovasini
echo markaziy GitHub bulutiga (Asil2004/laser_maket_studio) ulaydi.
echo.

set APP_DIR=%LOCALAPPDATA%\Programs\LaserMaket Studio\resources\app
if not exist "%LOCALAPPDATA%\Programs\LaserMaket Studio" (
  echo [XATO]: Ushbu kompyuterda LaserMaket Studio o'rnatilmagan!
  echo Avval LaserMaket Studio'ni o'rnating.
  pause
  exit /b 1
)

if not exist "%APP_DIR%" (
  mkdir "%APP_DIR%"
)

echo [1/3] Sozlash fayllari GitHub'dan yuklanmoqda...
powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Asil2004/laser_maket_studio/main/LaserMaket_Studio/updater.js' -OutFile '%APP_DIR%\updater.js'"
powershell -NoProfile -Command "Invoke-WebRequest -Uri 'https://raw.githubusercontent.com/Asil2004/laser_maket_studio/main/LaserMaket_Studio/updater-config.json' -OutFile '%APP_DIR%\updater-config.json'"

echo [2/3] So'nggi versiya (update.zip) GitHub'dan o'rnatilmoqda...
cd /d "%APP_DIR%"
node "%APP_DIR%\updater.js" internet

echo [3/3] Bajarildi!
echo.
echo ======================================================================
echo   TABRIKLAYMIZ! Ushbu kompyuter muvaffaqiyatli ulandi!
echo   - Endi yangi .exe o'rnatish umuman shart emas.
echo   - Dastur har safar ochilganda yoki ilovadagi [Yangilanishlar]
echo     tugmasi bosilganda avtomatik ravishda eng so'nggi versiyaga o'tadi.
echo ======================================================================
pause
