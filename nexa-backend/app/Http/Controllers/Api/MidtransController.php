<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\InvoiceEmailService;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class MidtransController extends Controller
{
    public function __construct(
        private readonly MidtransService $midtransService,
        private readonly InvoiceEmailService $invoiceEmailService
    ) {}

    /**
     * Public Midtrans client config so frontend loads Snap JS dynamically.
     */
    public function config(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'configured' => $this->midtransService->isConfigured(),
                'client_key' => $this->midtransService->getClientKey(),
                'is_production' => $this->midtransService->isProduction(),
                'snap_script_url' => $this->midtransService->getSnapScriptUrl(),
            ],
        ]);
    }

    /**
     * Create or refresh a Midtrans Snap token for an unpaid order.
     */
    public function createTransaction(string $id): JsonResponse
    {
        $order = Order::with('invoice')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Pesanan {$id} tidak ditemukan",
            ], 404);
        }

        if (strtoupper((string) $order->payment_status) === 'PAID') {
            return response()->json([
                'success' => false,
                'message' => 'Pesanan ini sudah lunas (PAID).',
            ], 422);
        }

        if (!$this->midtransService->isConfigured()) {
            return response()->json([
                'success' => false,
                'message' => 'Midtrans belum dikonfigurasi. Isi MIDTRANS_SERVER_KEY dan MIDTRANS_CLIENT_KEY di nexa-backend/.env.',
            ], 422);
        }

        try {
            $snap = $this->midtransService->createSnapTransaction($order);

            $order->midtrans_order_id = $snap['midtrans_order_id'];
            $order->snap_token = $snap['snap_token'];
            $order->payment_url = $snap['redirect_url'];
            $order->save();

            if ($order->invoice) {
                $order->invoice->midtrans_order_id = $snap['midtrans_order_id'];
                $order->invoice->snap_token = $snap['snap_token'];
                $order->invoice->payment_url = $snap['redirect_url'];
                $order->invoice->save();
            }

            return response()->json([
                'success' => true,
                'message' => 'Token pembayaran Midtrans berhasil dibuat',
                'data' => [
                    'order' => $order->fresh(['invoice']),
                    'snap_token' => $snap['snap_token'],
                    'redirect_url' => $snap['redirect_url'],
                    'midtrans_order_id' => $snap['midtrans_order_id'],
                ],
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Receive webhook notification callback from Midtrans.
     */
    public function notification(Request $request): JsonResponse
    {
        $payload = $request->all();

        if (!$this->midtransService->verifySignature($payload)) {
            Log::warning('[Midtrans] Signature webhook tidak valid', [
                'order_id' => $payload['order_id'] ?? null,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Invalid signature',
            ], 403);
        }

        $midtransOrderId = (string) ($payload['order_id'] ?? '');
        $order = Order::with('invoice')
            ->where('midtrans_order_id', $midtransOrderId)
            ->orWhere('id', $midtransOrderId)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order tidak ditemukan',
            ], 404);
        }

        $result = $this->midtransService->applyTransactionStatus($order, $payload);
        $updatedOrder = $result['order'];

        if ($result['newly_paid'] && $updatedOrder->invoice) {
            try {
                $this->invoiceEmailService->send($updatedOrder->invoice);
            } catch (Throwable $e) {
                Log::warning('[Midtrans] Gagal mengirim email konfirmasi lunas: ' . $e->getMessage());
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Notifikasi Midtrans berhasil diproses',
            'data' => $updatedOrder,
        ]);
    }

    /**
     * Query Midtrans transaction status manually (useful during local testing or fallback).
     */
    public function syncStatus(string $id): JsonResponse
    {
        $order = Order::with('invoice')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Pesanan {$id} tidak ditemukan",
            ], 404);
        }

        $midtransOrderId = $order->midtrans_order_id ?: $order->id;

        try {
            $statusPayload = $this->midtransService->getTransactionStatus($midtransOrderId);
            $result = $this->midtransService->applyTransactionStatus($order, $statusPayload);
            $updatedOrder = $result['order'];

            if ($result['newly_paid'] && $updatedOrder->invoice) {
                try {
                    $this->invoiceEmailService->send($updatedOrder->invoice);
                } catch (Throwable $e) {
                    Log::warning('[Midtrans Sync] Gagal mengirim email invoice lunas: ' . $e->getMessage());
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Status transaksi berhasil disinkronkan dari Midtrans',
                'data' => $updatedOrder,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
