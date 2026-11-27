<?php

use App\Models\Invoice;
use App\Models\Order;
use App\Models\Service;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $servicesCount = Service::count();
    $ordersCount = Order::count();
    $invoicesCount = Invoice::count();

    return view('backend', compact('servicesCount', 'ordersCount', 'invoicesCount'));
});

Route::get('/backend', function () {
    $servicesCount = Service::count();
    $ordersCount = Order::count();
    $invoicesCount = Invoice::count();

    return view('backend', compact('servicesCount', 'ordersCount', 'invoicesCount'));
});

Route::get('/admin', function () {
    $servicesCount = Service::count();
    $ordersCount = Order::count();
    $invoicesCount = Invoice::count();

    return view('backend', compact('servicesCount', 'ordersCount', 'invoicesCount'));
});
