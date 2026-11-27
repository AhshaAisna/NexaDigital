<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Penjadwalan server cronjob setiap 5 menit untuk mengecek invoice PENDING & kirim reminder SMTP
Schedule::command('invoices:send-reminders')
    ->everyFiveMinutes()
    ->withoutOverlapping();
