@echo off
:: OBS Web Studio - Sunucu Durdurma Scripti

title OBS Web Studio - Stop Server

echo.
echo  [*] Node.js islemleri durduruluyor...
echo.

:: Node.js işlemlerini sonlandır
taskkill /F /IM node.exe >nul 2>&1

if %errorLevel% == 0 (
    echo  [+] Sunucu basariyla durduruldu.
) else (
    echo  [*] Calisan sunucu bulunamadi.
)

echo.
pause
