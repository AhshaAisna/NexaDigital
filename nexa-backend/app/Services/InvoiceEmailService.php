<?php

namespace App\Services;

use App\Mail\InvoiceMail;
use App\Models\Invoice;
use Illuminate\Support\Facades\Mail;
use InvalidArgumentException;
use RuntimeException;

class InvoiceEmailService
{
    /**
     * Send invoice or payment reminder email via configured mailer (SMTP).
     */
    public function send(Invoice $invoice, ?string $recipientOverride = null, bool $isReminder = false): Invoice
    {
        $recipient = trim((string) ($recipientOverride ?: $invoice->customer_email));

        if (!filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("Alamat email tujuan tidak valid: '{$recipient}'");
        }

        $this->ensureMailerConfigured();

        Mail::to($recipient)->send(new InvoiceMail($invoice, $isReminder));

        $updates = [
            'email_sent_at' => now(),
        ];

        if ($isReminder) {
            $updates['last_reminded_at'] = now();
            $updates['reminder_count'] = ((int) $invoice->reminder_count) + 1;
        }

        $invoice->forceFill($updates)->save();

        return $invoice->fresh('order');
    }

    /**
     * Ensure SMTP credentials are filled before attempting network mail delivery.
     */
    private function ensureMailerConfigured(): void
    {
        if (config('mail.default') !== 'smtp') {
            return;
        }

        $host = (string) config('mail.mailers.smtp.host');
        $port = (int) config('mail.mailers.smtp.port');
        $username = (string) config('mail.mailers.smtp.username');

        // Allow local mail catchers (e.g. Mailpit/Mailhog on 1025/2525) without auth,
        // but fail early with a clear message when default 127.0.0.1:587 placeholder is untouched.
        $isUntouchedPlaceholder = ($host === '127.0.0.1' || $host === 'localhost')
            && $port === 587
            && $username === '';

        if ($host === '' || $isUntouchedPlaceholder) {
            throw new RuntimeException(
                'Konfigurasi SMTP belum diisi di file nexa-backend/.env (MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS).'
            );
        }
    }
}
