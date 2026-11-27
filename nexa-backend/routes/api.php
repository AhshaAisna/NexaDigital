<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\InvoiceController;
use App\Http\Controllers\Api\MidtransController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\ServiceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Nexa Digital Backend
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'Nexa Digital API',
        'timestamp' => now()->toISOString(),
    ]);
});

// Authentication Routes (Client & Admin & Pegawai)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'registerClient']);
    Route::post('/login', [AuthController::class, 'loginClient']);
    Route::post('/unified-login', [AuthController::class, 'loginUnified']);
    Route::post('/pegawai/login', [AuthController::class, 'loginPegawai']);
    Route::post('/admin/login', [AuthController::class, 'loginAdmin']);
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
});

// Clients & Users list
Route::get('/clients', [AuthController::class, 'getClients']);
Route::get('/users', [AuthController::class, 'getUsers']);

// Services & Packages (Product Management)
Route::get('/services', [ServiceController::class, 'index']);
Route::get('/services/{id}', [ServiceController::class, 'show']);
Route::post('/services', [ServiceController::class, 'store']);
Route::put('/services/{id}', [ServiceController::class, 'update']);
Route::delete('/services/{id}', [ServiceController::class, 'destroy']);

// Orders & Tracking
Route::get('/orders', [OrderController::class, 'index']);
Route::get('/orders/{id}', [OrderController::class, 'show']);
Route::post('/orders', [OrderController::class, 'store']);
Route::patch('/orders/{id}/status', [OrderController::class, 'updateStatus']);
Route::patch('/orders/{id}/payment', [OrderController::class, 'updatePayment']);
Route::post('/orders/{id}/messages', [OrderController::class, 'addMessage']);

// Invoices & Email Delivery
Route::get('/invoices', [InvoiceController::class, 'index']);
Route::get('/invoices/{id}', [InvoiceController::class, 'show']);
Route::post('/invoices/{id}/send-email', [InvoiceController::class, 'sendEmail']);

// Midtrans Payment Gateway
Route::get('/midtrans/config', [MidtransController::class, 'config']);
Route::post('/midtrans/notification', [MidtransController::class, 'notification']);
Route::post('/orders/{id}/pay', [MidtransController::class, 'createTransaction']);
Route::get('/orders/{id}/payment-status', [MidtransController::class, 'syncStatus']);

// Portfolio Projects
Route::get('/portfolio', [PortfolioController::class, 'index']);
Route::get('/portfolio/{id}', [PortfolioController::class, 'show']);

// Contact & Inquiries
Route::post('/contact', [ContactController::class, 'store']);
Route::get('/contact', [ContactController::class, 'index']);

// Dashboard Statistics (Admin)
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
