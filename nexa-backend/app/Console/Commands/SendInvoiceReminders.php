<?php

namespace App\Console\Commands;

use App\Models\Invoice;
use App\Services\InvoiceEmailService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendInvoiceReminders extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'invoices:send-reminders {--force : Abaikan jeda cooldown dan delay awal untuk pengujian}';

    /**
     * The console command description.
     */
    protected $description = 'Mengecek invoice PENDING secara berkala dan mengirim email pengingat via SMTP';

    /**
     * Execute the console command.
     */
    public function handle(InvoiceEmailService $invoiceEmailService): int
    {
        $force = (bool) $this->option('force');
        $initialDelayMinutes = max(0, (int) config('services.invoice_reminder.initial_delay_minutes', 5));
        $cooldownMinutes = max(1, (int) config('services.invoice_reminder.cooldown_minutes', 1440));
        $daysBeforeDue = max(0, (int) config('services.invoice_reminder.days_before_due', 30));
        $maxCount = max(1, (int) config('services.invoice_reminder.max_count', 5));

        $query = Invoice::with('order')
            ->where('status', 'PENDING')
            ->whereNotNull('customer_email')
            ->where('customer_email', '!=', '')
            ->whereDate('due_date', '<=', now()->addDays($daysBeforeDue)->toDateString())
            ->where('reminder_count', '<', $maxCount);

        if (!$force) {
            $query->where('created_at', '<=', now()->subMinutes($initialDelayMinutes))
                ->where(function ($sub) use ($cooldownMinutes) {
                    $sub->whereNull('last_reminded_at')
                        ->orWhere('last_reminded_at', '<=', now()->subMinutes($cooldownMinutes));
                });
        }

        $invoices = $query->orderBy('due_date', 'asc')->get();

        if ($invoices->isEmpty()) {
            $this->info('Tidak ada invoice PENDING yang perlu dikirimi reminder saat ini.');
            return self::SUCCESS;
        }

        $sent = 0;
        $failed = 0;

        foreach ($invoices as $invoice) {
            try {
                $invoiceEmailService->send($invoice, null, true);
                $sent++;
                $this->line("Reminder terkirim ke {$invoice->customer_email} ({$invoice->invoice_number})");
            } catch (Throwable $e) {
                $failed++;
                Log::error("[InvoiceReminder] Gagal kirim {$invoice->invoice_number}: " . $e->getMessage());
                $this->error("Gagal kirim {$invoice->invoice_number}: " . $e->getMessage());
            }
        }

        $this->info("Selesai cek reminder: {$sent} terkirim, {$failed} gagal.");

        return $failed > 0 && $sent === 0 ? self::FAILURE : self::SUCCESS;
    }
}
