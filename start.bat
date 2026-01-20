@echo off
:: OBS Web Studio - Windows Başlatıcı
:: Bu script otomatik olarak Administrator izni alır ve uygulamayı başlatır

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

:: Başlık ayarla
title OBS Web Studio - Local Server

:: Renk ayarla (Cyberpunk teması - Cyan üzerine siyah)
color 0B

echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║                                                               ║
echo  ║   ██████╗ ██████╗ ███████╗    ██╗    ██╗███████╗██████╗      ║
echo  ║  ██╔═══██╗██╔══██╗██╔════╝    ██║    ██║██╔════╝██╔══██╗     ║
echo  ║  ██║   ██║██████╔╝███████╗    ██║ █╗ ██║█████╗  ██████╔╝     ║
echo  ║  ██║   ██║██╔══██╗╚════██║    ██║███╗██║██╔══╝  ██╔══██╗     ║
echo  ║  ╚██████╔╝██████╔╝███████║    ╚███╔███╔╝███████╗██████╔╝     ║
echo  ║   ╚═════╝ ╚═════╝ ╚══════╝     ╚══╝╚══╝ ╚══════╝╚═════╝      ║
echo  ║                                                               ║
echo  ║                    S T U D I O                                ║
echo  ║                                                               ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.
echo  [*] Administrator izni alindi
echo  [*] Calisma dizini: %CD%
echo.

:: Node.js kontrolü
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo  [!] HATA: Node.js bulunamadi!
    echo  [!] Lutfen Node.js yukleyin: https://nodejs.org/
    echo.
    pause
    exit /B 1
)

:: Node.js versiyonu göster
for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo  [*] Node.js versiyonu: %NODE_VERSION%

:: pnpm kontrolü
where pnpm >nul 2>&1
if %errorLevel% neq 0 (
    echo  [!] pnpm bulunamadi, npm ile kuruluyor...
    npm install -g pnpm
)

:: Bağımlılıkları kontrol et
if not exist "node_modules" (
    echo  [*] Bagimliliklar yukleniyor...
    call pnpm install
    if %errorLevel% neq 0 (
        echo  [!] HATA: Bagimliliklar yuklenemedi!
        pause
        exit /B 1
    )
)

echo.
echo  ╔═══════════════════════════════════════════════════════════════╗
echo  ║  Sunucu baslatiliyor...                                       ║
echo  ║                                                               ║
echo  ║  Ana Sayfa:    http://localhost:3000                          ║
echo  ║  Config:       http://localhost:3000/config                   ║
echo  ║                                                               ║
echo  ║  Durdurmak icin CTRL+C basin                                  ║
echo  ╚═══════════════════════════════════════════════════════════════╝
echo.

:: Development sunucusunu başlat
call pnpm dev

:: Hata durumunda
if %errorLevel% neq 0 (
    echo.
    echo  [!] Sunucu beklenmedik sekilde durdu.
    pause
)
