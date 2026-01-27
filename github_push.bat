@echo off
setlocal
echo ======================================================
echo   Git Kimlik Bilgilerini Temizleme ve Push Aracı
echo ======================================================
echo.

echo [1/3] Mevcut Git kimlik bilgileri temizleniyor...
echo cmdkey /delete:git:https://github.com komutu calistiriliyor...
cmdkey /delete:git:https://github.com >nul 2>&1

echo [2/3] Remote URL guncelleniyor (Kullanici: brawlquiz)...
git remote set-url origin https://github.com/brawlquiz/obs-web-studio.git

echo [3/3] Kodu pushlama islemi baslatiliyor...
echo.
echo DIKKAT: Birazdan bir giris penceresi acilabilir. 
echo Lutfen yeni hesabinizla (brawlquiz) giris yapin.
echo.

git push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ======================================================
    echo   BASARILI! Proje GitHub'a yuklendi.
    echo ======================================================
) else (
    echo.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    echo   HATA: Push islemi basarisiz oldu.
    echo   Lutfen internet baglantinizi ve yetkilerinizi kontrol edin.
    echo !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
)

pause
