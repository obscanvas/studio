@echo off
:: OBS Web Studio - Production Build Scripti

:: Admin kontrolü
net session >nul 2>&1
if %errorLevel% == 0 (
    goto :admin
) else (
    goto :requestAdmin
)

:requestAdmin
    echo Administrator izni isteniyor...
    echo Set UAC = CreateObject^("Shell.Application"^) > "%temp%\getadmin.vbs"
    echo UAC.ShellExecute "%~s0", "", "", "runas", 1 >> "%temp%\getadmin.vbs"
    "%temp%\getadmin.vbs"
    del "%temp%\getadmin.vbs"
    exit /B

:admin
    pushd "%CD%"
    CD /D "%~dp0"

title OBS Web Studio - Build

color 0B

echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║             OBS WEB STUDIO - PRODUCTION BUILD                 ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.

:: Node.js kontrolü
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo  [!] HATA: Node.js bulunamadi!
    pause
    exit /B 1
)

:: Bağımlılıkları kontrol et
if not exist "node_modules" (
    echo  [*] Bagimliliklar yukleniyor...
    call pnpm install
)

echo  [*] Production build olusturuluyor...
echo.

call pnpm build

if %errorLevel% == 0 (
    echo.
    echo  ╔═══════════════════════════════════════════════════════════════╗
    echo  ║  Build basarili!                                              ║
    echo  ║                                                               ║
    echo  ║  Cikti dizini: dist/                                          ║
    echo  ║                                                               ║
    echo  ║  Production sunucusu icin: pnpm start                         ║
    echo  ╚═══════════════════════════════════════════════════════════════╝
) else (
    echo.
    echo  [!] Build basarisiz oldu!
)

echo.
pause
