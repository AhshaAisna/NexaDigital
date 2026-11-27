<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Services\InvoiceEmailService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use InvalidArgumentException;
use Throwable;

class InvoiceController extends Controller
{
    public function __construct(
        private readonly InvoiceEmailService $invoiceEmailService
    ) {}

    /**
     * Get all invoices.
     */
    public function index(): JsonResponse
    {
        $invoices = Invoice::with('order')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar faktur berhasil diambil',
            'data' => $invoices,
        ]);
    }

    /**
     * Get single invoice by invoice_number or order_id or id.
     */
    public function show(string $id): JsonResponse
    {
        $invoice = $this->findInvoice($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => "Faktur {$id} tidak ditemukan",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail faktur berhasil diambil',
            'data' => $invoice,
        ]);
    }

    /**
     * Send invoice (or payment reminder) to client email via configured SMTP.
     */
    public function sendEmail(Request $request, string $id): JsonResponse
    {
        $invoice = $this->findInvoice($id);

        if (!$invoice) {
            return response()->json([
                'success' => false,
                'message' => "Faktur {$id} tidak ditemukan",
            ], 404);
        }

        $validated = $request->validate([
            'email' => 'nullable|email|max:255',
            'is_reminder' => 'nullable|boolean',
        ]);

        try {
            $updatedInvoice = $this->invoiceEmailService->send(
                $invoice,
                $validated['email'] ?? null,
                (bool) ($validated['is_reminder'] ?? false)
            );

            $recipient = $validated['email'] ?? $updatedInvoice->customer_email;

            return response()->json([
                'success' => true,
                'message' => "Invoice {$updatedInvoice->invoice_number} berhasil dikirim ke {$recipient}",
                'data' => $updatedInvoice,
            ]);
        } catch (InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        } catch (Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim email invoice via SMTP: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function findInvoice(string $id): ?Invoice
    {
        return Invoice::with('order')
            ->where('invoice_number', $id)
            ->orWhere('order_id', $id)
            ->orWhere('id', $id)
            ->first();
    }
}
