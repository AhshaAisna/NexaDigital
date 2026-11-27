<?php

namespace App\Mail;

use App\Models\Invoice;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class InvoiceMail extends Mailable
{
    use Queueable, SerializesModels;

    public Invoice $invoice;
    public bool $isReminder;

    /**
     * Create a new message instance.
     */
    public function __construct(Invoice $invoice, bool $isReminder = false)
    {
        $this->invoice = $invoice->loadMissing('order');
        $this->isReminder = $isReminder;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $prefix = match (true) {
            $this->isReminder => '[Pengingat Tagihan]',
            strtoupper((string) $this->invoice->status) === 'PAID' => '[Lunas - Bukti Pembayaran]',
            default => '[Tagihan Resmi]',
        };

        return new Envelope(
            subject: "{$prefix} Invoice {$this->invoice->invoice_number} — Nexa Digital",
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        $frontendUrl = rtrim((string) config('app.frontend_url', 'http://localhost:5173'), '/');
        $invoiceUrl = "{$frontendUrl}/#invoice?orderId={$this->invoice->order_id}";

        return new Content(
            view: 'emails.invoice',
            with: [
                'invoice' => $this->invoice,
                'isReminder' => $this->isReminder,
                'invoiceUrl' => $invoiceUrl,
                'paymentUrl' => $this->invoice->payment_url ?: $invoiceUrl,
            ],
        );
    }

    /**
     * Get the attachments for the message.
     *
     * @return array<int, \Illuminate\Mail\Mailables\Attachment>
     */
    public function attachments(): array
    {
        return [];
    }
}
