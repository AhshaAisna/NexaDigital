@echo off
title Nexa Digital - Backend Laravel Server
echo ========================================================
echo   Menjalankan Backend Laravel PT Nexa Digital Solusindo
echo   Database: MySQL phpMyAdmin (nexa_digital)
echo   URL: http://127.0.0.1:8000
echo ========================================================
cd /d "%~dp0\nexa-backend"
set "PATH=C:\xampp\php;%PATH%"
php artisan serve --host=127.0.0.1 --port=8000
pause
