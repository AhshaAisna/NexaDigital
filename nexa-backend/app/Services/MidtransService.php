<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

class MidtransService
{
    public function isConfigured(): bool
    {
        return !empty(config('services.midtrans.server_key'))
            && !empty(config('services.midtrans.client_key'));
    }

    public function isProduction(): bool
    {
        return (bool) config('services.midtrans.is_production', false);
    }

    public function getClientKey(): string
    {
        return (string) config('services.midtrans.client_key', '');
    }

    public function getSnapScriptUrl(): string
    {
        return $this->isProduction()
            ? 'https://app.midtrans.com/snap/snap.js'
            : 'https://app.sandbox.midtrans.com/snap/snap.js';
    }

    private function getSnapApiUrl(): string
    {
        return $this->isProduction()
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';
    }

    private function getCoreApiBaseUrl(): string
    {
        return $this->isProduction()
            ? 'https://api.midtrans.com/v2'
            : 'https://api.sandbox.midtrans.com/v2';
    }

    /**
     * Create a Snap transaction token & redirect URL for an order.
     */
    public function createSnapTransaction(Order $order): array
    {
        $serverKey = (string) config('services.midtrans.server_key');
        if ($serverKey === '') {
            throw new RuntimeException(
                'MIDTRANS_SERVER_KEY belum dikonfigurasi di file nexa-backend/.env.'
            );
        }

        $grossAmount = (int) round((float) $order->total);
        if ($grossAmount < 1) {
            throw new RuntimeException('Total tagihan Midtrans minimal Rp 1.');
        }

        // Midtrans limits order_id to 50 chars and requires uniqueness per Snap token attempt.
        $midtransOrderId = Str::limit($order->id, 35, '') . '-' . now()->format('His') . Str::upper(Str::random(3));

        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:5173'), '/');
        $finishUrl = "{$frontendUrl}/#invoice?orderId={$order->id}";

        $payload = [
            'transaction_details' => [
                'order_id' => $midtransOrderId,
                'gross_amount' => $grossAmount,
            ],
            'item_details' => $this->buildItemDetails($order, $grossAmount),
            'customer_details' => [
                'first_name' => Str::limit((string) $order->customer_name, 50, ''),
                'email' => (string) $order->customer_email,
                'phone' => (string) ($order->customer_phone ?: '-'),
            ],
            'callbacks' => [
                'finish' => $finishUrl,
            ],
        ];

        $response = Http::withBasicAuth($serverKey, '')
            ->acceptJson()
            ->timeout(15)
            ->post($this->getSnapApiUrl(), $payload);

        if (!$response->successful()) {
            $errorMessages = $response->json('error_messages');
            $detail = is_array($errorMessages) ? implode(', ', $errorMessages) : $response->body();
            throw new RuntimeException("Gagal membuat transaksi Midtrans Snap: {$detail}");
        }

        $data = $response->json();
        if (empty($data['token'])) {
            throw new RuntimeException('Respons Midtrans tidak menyertakan Snap token.');
        }

        return [
            'midtrans_order_id' => $midtransOrderId,
            'snap_token' => $data['token'],
            'redirect_url' => $data['redirect_url'] ?? null,
        ];
    }

    /**
     * Fetch transaction status directly from Midtrans Core API.
     */
    public function getTransactionStatus(string $midtransOrderId): array
    {
        $serverKey = (string) config('services.midtrans.server_key');
        if ($serverKey === '') {
            throw new RuntimeException('MIDTRANS_SERVER_KEY belum dikonfigurasi.');
        }

        $response = Http::withBasicAuth($serverKey, '')
            ->acceptJson()
            ->timeout(15)
            ->get($this->getCoreApiBaseUrl() . '/' . urlencode($midtransOrderId) . '/status');

        if (!$response->successful()) {
            $detail = $response->json('status_message') ?? $response->body();
            throw new RuntimeException("Gagal memeriksa status Midtrans: {$detail}");
        }

        return $response->json();
    }

    /**
     * Verify Midtrans notification webhook signature_key.
     */
    public function verifySignature(array $payload): bool
    {
        $serverKey = (string) config('services.midtrans.server_key');
        if ($serverKey === '') {
            return false;
        }

        $orderId = (string) ($payload['order_id'] ?? '');
        $statusCode = (string) ($payload['status_code'] ?? '');
        $grossAmount = (string) ($payload['gross_amount'] ?? '');
        $signatureKey = (string) ($payload['signature_key'] ?? '');

        if ($orderId === '' || $statusCode === '' || $grossAmount === '' || $signatureKey === '') {
            return false;
        }

        $expected = hash('sha512', $orderId . $statusCode . $grossAmount . $serverKey);

        return hash_equals($expected, $signatureKey);
    }

    /**
     * Apply Midtrans transaction status to Order and Invoice consistently.
     *
     * @return array{order: Order, newly_paid: bool}
     */
    public function applyTransactionStatus(Order $order, array $payload): array
    {
        $transactionStatus = strtolower((string) ($payload['transaction_status'] ?? 'pending'));
        $fraudStatus = strtolower((string) ($payload['fraud_status'] ?? 'accept'));
        $paymentType = (string) ($payload['payment_type'] ?? $order->payment_type ?? '');

        $wasPaid = strtoupper((string) $order->payment_status) === 'PAID';

        $isPaidEvent = ($transactionStatus === 'capture' && $fraudStatus === 'accept')
            || $transactionStatus === 'settlement';
        $isCancelledEvent = in_array($transactionStatus, ['deny', 'cancel', 'expire', 'failure'], true);

        $order->transaction_status = $transactionStatus;
        if ($paymentType !== '') {
            $order->payment_type = $paymentType;
            $order->payment_method = $this->formatPaymentMethod($paymentType, $payload);
        }
        $order->midtrans_response = $payload;

        $newlyPaid = false;

        if ($isPaidEvent) {
            $order->payment_status = 'PAID';
            if (!$order->paid_at) {
                $order->paid_at = now();
            }
            if (in_array($order->project_status, ['Menunggu Pembayaran', 'pending'], true)) {
                $order->project_status = 'Sedang Dikerjakan';
            }
            if ((int) $order->progress < 20) {
                $order->progress = 20;
            }

            if (!$wasPaid) {
                $newlyPaid = true;
                $timeline = $order->timeline ?? [];
                $timeline[] = [
                    'stage' => 'Pembayaran Terverifikasi (Midtrans)',
                    'date' => now()->translatedFormat('d M Y, H:i') . ' WIB',
                    'status' => 'completed',
                    'desc' => "Pembayaran lunas via {$order->payment_method} telah dikonfirmasi otomatis.",
                ];
                $order->timeline = $timeline;
            }
        } elseif ($isCancelledEvent && !$wasPaid) {
            $order->payment_status = strtoupper($transactionStatus === 'expire' ? 'EXPIRED' : 'CANCELLED');
        } elseif (!$wasPaid) {
            $order->payment_status = 'PENDING';
        }

        $order->save();

        if ($order->invoice) {
            $order->invoice->status = $order->payment_status;
            if ($paymentType !== '') {
                $order->invoice->payment_method = $order->payment_method;
            }
            if ($order->paid_at && !$order->invoice->paid_at) {
                $order->invoice->paid_at = $order->paid_at;
            }
            $order->invoice->save();
        }

        return [
            'order' => $order->fresh(['invoice']),
            'newly_paid' => $newlyPaid,
        ];
    }

    private function buildItemDetails(Order $order, int $grossAmount): array
    {
        $price = (int) round((float) $order->price);
        $discount = (int) round((float) $order->discount);
        $tax = (int) round((float) $order->tax);

        $items = [
            [
                'id' => Str::limit((string) $order->service_id, 45, ''),
                'price' => $price,
                'quantity' => 1,
                'name' => Str::limit("{$order->service_name} ({$order->package_name})", 50, ''),
            ],
        ];

        if ($discount > 0) {
            $items[] = [
                'id' => 'DISCOUNT',
                'price' => -$discount,
                'quantity' => 1,
                'name' => 'Diskon Promo',
            ];
        }

        if ($tax > 0) {
            $items[] = [
                'id' => 'PPN-11',
                'price' => $tax,
                'quantity' => 1,
                'name' => 'Pajak PPN (11%)',
            ];
        }

        $sum = array_sum(array_map(fn ($item) => $item['price'] * $item['quantity'], $items));

        if ($sum !== $grossAmount) {
            return [[
                'id' => Str::limit((string) $order->id, 45, ''),
                'price' => $grossAmount,
                'quantity' => 1,
                'name' => Str::limit((string) $order->service_name, 50, ''),
            ]];
        }

        return $items;
    }

    private function formatPaymentMethod(string $paymentType, array $payload): string
    {
        if ($paymentType === 'bank_transfer' && !empty($payload['va_numbers'][0]['bank'])) {
            $bank = strtoupper((string) $payload['va_numbers'][0]['bank']);
            return "Midtrans ({$bank} VA)";
        }

        return match ($paymentType) {
            'qris' => 'Midtrans (QRIS)',
            'gopay' => 'Midtrans (GoPay)',
            'shopeepay' => 'Midtrans (ShopeePay)',
            'echannel' => 'Midtrans (Mandiri Bill)',
            'credit_card' => 'Midtrans (Kartu Kredit/Debit)',
            'cstore' => 'Midtrans (Convenience Store)',
            default => 'Midtrans (' . Str::headline($paymentType) . ')',
        };
    }
}
