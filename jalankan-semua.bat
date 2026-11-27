@echo off
title Nexa Digital - Jalankan Semua Server
echo ========================================================
echo   PT Nexa Digital Solusindo - Startup Studio
echo ========================================================
echo [1/2] Menjalankan Backend Laravel (Port 8000)...
start "Nexa Backend" cmd /k "cd /d %~dp0\nexa-backend && set PATH=C:\xampp\php;%PATH% && php artisan serve --host=127.0.0.1 --port=8000"

echo [2/2] Menjalankan Frontend Svelte (Port 5173)...
start "Nexa Frontend" cmd /k "cd /d %~dp0 && npm run dev"

echo Selesai! Buka browser di http://localhost:5173
pause
