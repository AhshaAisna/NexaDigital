<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Order;
use App\Services\InvoiceEmailService;
use App\Services\MidtransService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Throwable;

class OrderController extends Controller
{
    public function __construct(
        private readonly MidtransService $midtransService,
        private readonly InvoiceEmailService $invoiceEmailService
    ) {}
    /**
     * Get list of orders with optional search and filter.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Order::with('invoice')->orderBy('created_at', 'desc');

        if ($request->has('search') && !empty($request->search)) {
            $s = $request->search;
            $query->where(function ($q) use ($s) {
                $q->where('id', 'like', "%{$s}%")
                  ->orWhere('customer_name', 'like', "%{$s}%")
                  ->orWhere('service_name', 'like', "%{$s}%");
            });
        }

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('project_status', $request->status);
        }

        if ($request->has('payment_status') && !empty($request->payment_status)) {
            $query->where('payment_status', $request->payment_status);
        }

        $orders = $query->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesanan berhasil diambil',
            'data' => $orders,
        ]);
    }

    /**
     * Get single order detail.
     */
    public function show(string $id): JsonResponse
    {
        $order = Order::with('invoice')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Pesanan dengan ID {$id} tidak ditemukan",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail pesanan berhasil diambil',
            'data' => $order,
        ]);
    }

    /**
     * Create a new order & automatic invoice.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'service_id' => 'sometimes|string',
            'serviceId' => 'sometimes|string',
            'service_name' => 'sometimes|string',
            'serviceName' => 'sometimes|string',
            'customer_name' => 'sometimes|string',
            'customerName' => 'sometimes|string',
            'customer_email' => 'sometimes|email',
            'customerEmail' => 'sometimes|email',
            'customer_phone' => 'sometimes|string',
            'customerPhone' => 'sometimes|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi data pemesanan gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Support both camelCase and snake_case inputs from frontend
        $serviceId = $request->input('serviceId', $request->input('service_id', 'ui-ux-design'));
        $serviceName = $request->input('serviceName', $request->input('service_name', 'Layanan Nexa Digital'));
        $packageId = $request->input('packageId', $request->input('package_id', 'standard'));
        $packageName = $request->input('packageName', $request->input('package_name', 'Paket Standar'));

        $customerName = $request->input('customerName', $request->input('customer_name', 'Klien Nexa'));
        $customerEmail = $request->input('customerEmail', $request->input('customer_email', 'klien@example.com'));
        $customerPhone = $request->input('customerPhone', $request->input('customer_phone', '-'));
        $customerCompany = $request->input('customerCompany', $request->input('customer_company', '-'));

        $price = max(0, (float) $request->input('price', 0));
        $discount = max(0, min($price, (float) $request->input('discount', 0)));
        $taxable = max(0, $price - $discount);
        $tax = (float) $request->input('tax', round($taxable * 0.11)); // PPN 11%
        $total = (float) $request->input('total', $taxable + $tax);

        $authUser = auth('sanctum')->user();
        $isStaffUser = $authUser && in_array($authUser->role, ['admin', 'pegawai'], true);
        $requestedPaymentStatus = strtoupper((string) $request->input('paymentStatus', $request->input('payment_status', 'PENDING')));

        // Client checkout always starts as PENDING; only authenticated admin/pegawai may record pre-paid manual orders.
        $paymentStatus = ($isStaffUser && $requestedPaymentStatus === 'PAID') ? 'PAID' : 'PENDING';
        $paymentMethod = $request->input('paymentMethod', $request->input('payment_method', 'Midtrans Payment Gateway'));
        $projectStatus = $paymentStatus === 'PAID' ? 'Sedang Dikerjakan' : 'Menunggu Pembayaran';
        $progress = $paymentStatus === 'PAID' ? 20 : 0;

        $deliveryDays = (int) $request->input('deliveryDays', $request->input('delivery_days', 5));
        $orderDate = now()->format('Y-m-d');
        $deadline = now()->addDays($deliveryDays)->format('Y-m-d');

        // Generate unique Order ID & Invoice Number safely without primary key collisions
        $year = now()->format('Y');
        $seq = Order::whereYear('created_at', $year)->count() + 1;
        do {
            $orderId = 'NXD-' . $year . '-' . str_pad((string) $seq, 3, '0', STR_PAD_LEFT);
            $seq++;
        } while (Order::where('id', $orderId)->exists());

        $invSeq = Invoice::whereYear('created_at', $year)->count() + 1;
        do {
            $invoiceNumber = 'INV-' . $year . '-' . str_pad((string) $invSeq, 5, '0', STR_PAD_LEFT);
            $invSeq++;
        } while (Invoice::where('invoice_number', $invoiceNumber)->exists());

        $requirements = $request->input('requirements', [
            'title' => $request->input('projectTitle', "Proyek {$serviceName}"),
            'description' => $request->input('projectDescription', 'Kebutuhan awal proyek telah diinput pada formulir checkout.'),
            'referenceUrl' => $request->input('referenceUrl', ''),
            'notes' => $request->input('notes', 'Tidak ada catatan tambahan.'),
        ]);

        $timeline = [
            [
                'stage' => 'Pesanan Diterima',
                'date' => now()->translatedFormat('d M Y, H:i') . ' WIB',
                'status' => 'completed',
                'desc' => "Pesanan dibuat dengan metode {$paymentMethod}.",
            ],
            [
                'stage' => 'Kebutuhan Proyek Dikirim',
                'date' => now()->translatedFormat('d M Y, H:i') . ' WIB',
                'status' => 'completed',
                'desc' => 'Dokumen brief dan detail proyek telah diterima sistem.',
            ],
            [
                'stage' => 'Proyek Dimulai',
                'date' => now()->addDay()->translatedFormat('d M Y') . ' (Estimasi)',
                'status' => $paymentStatus === 'PAID' ? 'current' : 'pending',
                'desc' => 'Tim spesialis Nexa Digital memulai tahap riset & pengembangan.',
            ],
            [
                'stage' => 'Review & Revisi',
                'date' => now()->addDays(max(1, $deliveryDays - 2))->translatedFormat('d M Y') . ' (Estimasi)',
                'status' => 'pending',
                'desc' => 'Penyampaian draf awal untuk ditinjau oleh pihak klien.',
            ],
            [
                'stage' => 'Selesai & Serah Terima',
                'date' => now()->addDays($deliveryDays)->translatedFormat('d M Y') . ' (Estimasi)',
                'status' => 'pending',
                'desc' => 'Finalisasi seluruh deliverables dan source code diserahterimakan.',
            ],
        ];

        $messages = [
            [
                'id' => 1,
                'sender' => 'Nexa Digital Support',
                'role' => 'agency',
                'time' => now()->translatedFormat('d M Y, H:i') . ' WIB',
                'text' => "Halo {$customerName}! Terima kasih telah melakukan pemesanan di Nexa Digital. Tim kami sedang menyiapkan ruang kerja proyek Anda.",
            ],
        ];

        DB::beginTransaction();
        try {
            $order = Order::create([
                'id' => $orderId,
                'invoice_number' => $invoiceNumber,
                'service_id' => $serviceId,
                'service_name' => $serviceName,
                'package_id' => $packageId,
                'package_name' => $packageName,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'customer_phone' => $customerPhone,
                'customer_company' => $customerCompany,
                'order_date' => $orderDate,
                'deadline' => $deadline,
                'price' => $price,
                'tax' => $tax,
                'discount' => $discount,
                'total' => $total,
                'payment_method' => $paymentMethod,
                'payment_status' => $paymentStatus,
                'paid_at' => $paymentStatus === 'PAID' ? now() : null,
                'project_status' => $projectStatus,
                'progress' => $progress,
                'assigned_team' => 'Tim Pengembang Nexa Digital',
                'requirements' => $requirements,
                'timeline' => $timeline,
                'messages' => $messages,
                'files' => [],
            ]);

            $invoice = Invoice::create([
                'invoice_number' => $invoiceNumber,
                'order_id' => $orderId,
                'issue_date' => $orderDate,
                'due_date' => $deadline,
                'customer_name' => $customerName,
                'customer_email' => $customerEmail,
                'customer_phone' => $customerPhone,
                'customer_company' => $customerCompany,
                'service_name' => $serviceName,
                'package_name' => $packageName,
                'subtotal' => $price,
                'tax_amount' => $tax,
                'discount_amount' => $discount,
                'total_amount' => $total,
                'payment_method' => $paymentMethod,
                'status' => $paymentStatus,
                'paid_at' => $paymentStatus === 'PAID' ? now() : null,
                'notes' => 'Faktur resmi diterbitkan otomatis oleh sistem PT Nexa Digital Solusindo.',
            ]);

            DB::commit();

            $snapToken = null;
            $redirectUrl = null;
            $midtransConfigured = $this->midtransService->isConfigured();
            $midtransError = null;

            if ($paymentStatus === 'PENDING' && $midtransConfigured && (float) $order->total >= 1) {
                try {
                    $snap = $this->midtransService->createSnapTransaction($order);
                    $snapToken = $snap['snap_token'];
                    $redirectUrl = $snap['redirect_url'];

                    $order->midtrans_order_id = $snap['midtrans_order_id'];
                    $order->snap_token = $snapToken;
                    $order->payment_url = $redirectUrl;
                    $order->transaction_status = 'pending';
                    $order->save();

                    $invoice->midtrans_order_id = $snap['midtrans_order_id'];
                    $invoice->snap_token = $snapToken;
                    $invoice->payment_url = $redirectUrl;
                    $invoice->save();
                } catch (Throwable $e) {
                    $midtransError = $e->getMessage();
                    Log::warning("[OrderController] Gagal buat Snap token {$orderId}: {$midtransError}");
                }
            }

            $emailSent = false;
            $emailNotice = null;
            if ($request->boolean('send_email', true)) {
                try {
                    $this->invoiceEmailService->send($invoice);
                    $emailSent = true;
                } catch (Throwable $e) {
                    $emailNotice = $e->getMessage();
                    Log::info("[OrderController] Email invoice awal belum terkirim ({$invoiceNumber}): {$emailNotice}");
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Pesanan dan faktur berhasil dibuat',
                'data' => [
                    'order' => $order->fresh(['invoice']),
                    'invoice' => $invoice->fresh(),
                    'snap_token' => $snapToken,
                    'redirect_url' => $redirectUrl,
                    'midtrans_configured' => $midtransConfigured,
                    'midtrans_error' => $midtransError,
                    'email_sent' => $emailSent,
                    'email_notice' => $emailNotice,
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat pesanan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update project progress and status (used by Admin Dashboard).
     */
    public function updateStatus(Request $request, string $id): JsonResponse
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Pesanan dengan ID {$id} tidak ditemukan",
            ], 404);
        }

        $request->validate([
            'status' => 'required|string',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        $order->project_status = $request->status;

        if ($request->has('progress')) {
            $order->progress = (int) $request->progress;
        }

        // Add to timeline
        $timeline = $order->timeline ?? [];
        $timeline[] = [
            'stage' => "Status Diperbarui: {$request->status}",
            'date' => now()->translatedFormat('d M Y, H:i') . ' WIB',
            'status' => 'completed',
            'desc' => "Progress proyek kini mencapai {$order->progress}%.",
        ];
        $order->timeline = $timeline;

        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Status pesanan berhasil diperbarui',
            'data' => $order,
        ]);
    }

    /**
     * Toggle or update payment status.
     */
    public function updatePayment(Request $request, string $id): JsonResponse
    {
        $order = Order::with('invoice')->find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Pesanan dengan ID {$id} tidak ditemukan",
            ], 404);
        }

        $request->validate([
            'payment_status' => 'required|string|in:PAID,PENDING',
        ]);

        $newPaymentStatus = $request->payment_status;
        $order->payment_status = $newPaymentStatus;

        if ($newPaymentStatus === 'PAID') {
            if (!$order->paid_at) {
                $order->paid_at = now();
            }
            if ($order->project_status === 'Menunggu Pembayaran' || $order->project_status === 'pending') {
                $order->project_status = 'Sedang Dikerjakan';
            }
            if ($order->progress < 20) {
                $order->progress = 20;
            }
        }

        $order->save();

        if ($order->invoice) {
            $order->invoice->status = $newPaymentStatus;
            if ($newPaymentStatus === 'PAID' && !$order->invoice->paid_at) {
                $order->invoice->paid_at = now();
            }
            $order->invoice->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Status pembayaran berhasil diperbarui',
            'data' => $order->fresh(['invoice']),
        ]);
    }

    /**
     * Add client or agency message to order communication thread.
     */
    public function addMessage(Request $request, string $id): JsonResponse
    {
        $order = Order::find($id);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => "Pesanan dengan ID {$id} tidak ditemukan",
            ], 404);
        }

        $request->validate([
            'sender' => 'required|string',
            'role' => 'required|string|in:agency,client',
            'text' => 'required|string',
        ]);

        $messages = $order->messages ?? [];
        $nextId = count($messages) + 1;

        $messages[] = [
            'id' => $nextId,
            'sender' => $request->sender,
            'role' => $request->role,
            'time' => now()->translatedFormat('d M Y, H:i') . ' WIB',
            'text' => $request->text,
        ];

        $order->messages = $messages;
        $order->save();

        return response()->json([
            'success' => true,
            'message' => 'Pesan berhasil ditambahkan',
            'data' => $order->messages,
        ]);
    }
}
