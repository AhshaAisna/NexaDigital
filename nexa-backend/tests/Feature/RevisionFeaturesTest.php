<?php

namespace Tests\Feature;

use App\Mail\InvoiceMail;
use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class RevisionFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_order_defaults_to_pending_and_creates_midtrans_snap_token(): void
    {
        Mail::fake();

        config()->set('services.midtrans.server_key', 'SB-Mid-server-test-key');
        config()->set('services.midtrans.client_key', 'SB-Mid-client-test-key');
        config()->set('services.midtrans.is_production', false);

        Http::fake([
            'https://app.sandbox.midtrans.com/snap/v1/transactions' => Http::response([
                'token' => 'snap-token-12345',
                'redirect_url' => 'https://app.sandbox.midtrans.com/snap/v2/vtweb/snap-token-12345',
            ], 201),
        ]);

        $response = $this->postJson('/api/orders', [
            'serviceId' => 'ui-ux-design',
            'serviceName' => 'UI/UX Design',
            'packageId' => 'standard',
            'packageName' => 'Standard',
            'customerName' => 'Rian Hidayat',
            'customerEmail' => 'rian@example.com',
            'customerPhone' => '+6281234567890',
            'price' => 1500000,
            'discount' => 0,
            'deliveryDays' => 5,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.snap_token', 'snap-token-12345')
            ->assertJsonPath('data.order.payment_status', 'PENDING')
            ->assertJsonPath('data.invoice.status', 'PENDING');

        $order = Order::first();
        $this->assertNotNull($order);
        $this->assertEquals('snap-token-12345', $order->snap_token);
        $this->assertNotNull($order->midtrans_order_id);

        Mail::assertSent(InvoiceMail::class, function (InvoiceMail $mail) {
            return $mail->hasTo('rian@example.com') && $mail->isReminder === false;
        });
    }

    public function test_invoice_send_email_endpoint_sends_mail_and_updates_timestamp(): void
    {
        Mail::fake();

        $order = Order::create([
            'id' => 'NXD-2026-901',
            'invoice_number' => 'INV-2026-00901',
            'service_id' => 'ui-ux-design',
            'service_name' => 'UI/UX Design',
            'package_id' => 'standard',
            'package_name' => 'Standard',
            'customer_name' => 'Siti Rahma',
            'customer_email' => 'siti@example.com',
            'customer_phone' => '08123456789',
            'order_date' => now()->format('Y-m-d'),
            'deadline' => now()->addDays(5)->format('Y-m-d'),
            'price' => 1000000,
            'tax' => 110000,
            'discount' => 0,
            'total' => 1110000,
            'payment_method' => 'Midtrans Payment Gateway',
            'payment_status' => 'PENDING',
            'project_status' => 'Menunggu Pembayaran',
            'progress' => 0,
        ]);

        Invoice::create([
            'invoice_number' => 'INV-2026-00901',
            'order_id' => $order->id,
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(5)->format('Y-m-d'),
            'customer_name' => 'Siti Rahma',
            'customer_email' => 'siti@example.com',
            'customer_phone' => '08123456789',
            'service_name' => 'UI/UX Design',
            'package_name' => 'Standard',
            'subtotal' => 1000000,
            'tax_amount' => 110000,
            'discount_amount' => 0,
            'total_amount' => 1110000,
            'payment_method' => 'Midtrans Payment Gateway',
            'status' => 'PENDING',
        ]);

        $response = $this->postJson('/api/invoices/INV-2026-00901/send-email');

        $response->assertStatus(200)
            ->assertJsonPath('success', true);

        Mail::assertSent(InvoiceMail::class, fn (InvoiceMail $mail) => $mail->hasTo('siti@example.com'));

        $invoice = Invoice::where('invoice_number', 'INV-2026-00901')->first();
        $this->assertNotNull($invoice->email_sent_at);
    }

    public function test_midtrans_webhook_validates_signature_and_marks_paid_idempotently(): void
    {
        Mail::fake();

        $serverKey = 'SB-Mid-server-secret';
        config()->set('services.midtrans.server_key', $serverKey);

        $order = Order::create([
            'id' => 'NXD-2026-902',
            'invoice_number' => 'INV-2026-00902',
            'service_id' => 'backend-development',
            'service_name' => 'Backend Development',
            'package_id' => 'standard',
            'package_name' => 'Standard',
            'customer_name' => 'Bambang',
            'customer_email' => 'bambang@example.com',
            'customer_phone' => '08123456789',
            'order_date' => now()->format('Y-m-d'),
            'deadline' => now()->addDays(5)->format('Y-m-d'),
            'price' => 2000000,
            'tax' => 220000,
            'discount' => 0,
            'total' => 2220000,
            'payment_method' => 'Midtrans Payment Gateway',
            'payment_status' => 'PENDING',
            'midtrans_order_id' => 'NXD-2026-902-120000ABC',
            'project_status' => 'Menunggu Pembayaran',
            'progress' => 0,
        ]);

        Invoice::create([
            'invoice_number' => 'INV-2026-00902',
            'order_id' => $order->id,
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(5)->format('Y-m-d'),
            'customer_name' => 'Bambang',
            'customer_email' => 'bambang@example.com',
            'customer_phone' => '08123456789',
            'service_name' => 'Backend Development',
            'package_name' => 'Standard',
            'subtotal' => 2000000,
            'tax_amount' => 220000,
            'discount_amount' => 0,
            'total_amount' => 2220000,
            'payment_method' => 'Midtrans Payment Gateway',
            'status' => 'PENDING',
            'midtrans_order_id' => 'NXD-2026-902-120000ABC',
        ]);

        // 1. Invalid signature must be rejected
        $this->postJson('/api/midtrans/notification', [
            'order_id' => 'NXD-2026-902-120000ABC',
            'status_code' => '200',
            'gross_amount' => '2220000.00',
            'transaction_status' => 'settlement',
            'signature_key' => 'invalid-signature',
        ])->assertStatus(403);

        // 2. Valid signature transitions to PAID and sends confirmation email once
        $validSig = hash('sha512', 'NXD-2026-902-120000ABC' . '200' . '2220000.00' . $serverKey);

        $payload = [
            'order_id' => 'NXD-2026-902-120000ABC',
            'status_code' => '200',
            'gross_amount' => '2220000.00',
            'transaction_status' => 'settlement',
            'payment_type' => 'qris',
            'signature_key' => $validSig,
        ];

        $this->postJson('/api/midtrans/notification', $payload)
            ->assertStatus(200)
            ->assertJsonPath('data.payment_status', 'PAID')
            ->assertJsonPath('data.project_status', 'Sedang Dikerjakan');

        $order->refresh();
        $this->assertEquals('PAID', $order->payment_status);
        $this->assertEquals('PAID', $order->invoice->status);
        $this->assertNotNull($order->paid_at);

        // Second identical webhook must remain idempotent (only 1 PAID email sent total)
        $this->postJson('/api/midtrans/notification', $payload)->assertStatus(200);
        Mail::assertSent(InvoiceMail::class, 1);
    }

    public function test_reminder_command_checks_pending_invoices_and_respects_cooldown(): void
    {
        Mail::fake();

        config()->set('services.invoice_reminder.initial_delay_minutes', 5);
        config()->set('services.invoice_reminder.cooldown_minutes', 1440);
        config()->set('services.invoice_reminder.days_before_due', 30);
        config()->set('services.invoice_reminder.max_count', 5);

        // Eligible order + invoice (created 10 minutes ago, PENDING)
        $eligibleOrder = Order::create([
            'id' => 'NXD-2026-903',
            'invoice_number' => 'INV-2026-00903',
            'service_id' => 'ui-ux-design',
            'service_name' => 'UI/UX Design',
            'package_id' => 'basic',
            'package_name' => 'Basic',
            'customer_name' => 'Eligible Client',
            'customer_email' => 'eligible@example.com',
            'customer_phone' => '08123',
            'order_date' => now()->format('Y-m-d'),
            'deadline' => now()->addDays(2)->format('Y-m-d'),
            'price' => 500000,
            'tax' => 55000,
            'discount' => 0,
            'total' => 555000,
            'payment_status' => 'PENDING',
            'project_status' => 'Menunggu Pembayaran',
            'progress' => 0,
        ]);

        $eligibleInvoice = Invoice::create([
            'invoice_number' => 'INV-2026-00903',
            'order_id' => $eligibleOrder->id,
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(2)->format('Y-m-d'),
            'customer_name' => 'Eligible Client',
            'customer_email' => 'eligible@example.com',
            'customer_phone' => '08123',
            'service_name' => 'UI/UX Design',
            'package_name' => 'Basic',
            'subtotal' => 500000,
            'tax_amount' => 55000,
            'discount_amount' => 0,
            'total_amount' => 555000,
            'status' => 'PENDING',
        ]);
        $eligibleInvoice->created_at = now()->subMinutes(10);
        $eligibleInvoice->save();

        // Brand-new PENDING invoice (1 minute ago) must wait for 5-minute delay
        $freshOrder = Order::create([
            'id' => 'NXD-2026-904',
            'invoice_number' => 'INV-2026-00904',
            'service_id' => 'ui-ux-design',
            'service_name' => 'UI/UX Design',
            'package_id' => 'basic',
            'package_name' => 'Basic',
            'customer_name' => 'Fresh Client',
            'customer_email' => 'fresh@example.com',
            'customer_phone' => '08123',
            'order_date' => now()->format('Y-m-d'),
            'deadline' => now()->addDays(2)->format('Y-m-d'),
            'price' => 500000,
            'tax' => 55000,
            'discount' => 0,
            'total' => 555000,
            'payment_status' => 'PENDING',
            'project_status' => 'Menunggu Pembayaran',
            'progress' => 0,
        ]);

        Invoice::create([
            'invoice_number' => 'INV-2026-00904',
            'order_id' => $freshOrder->id,
            'issue_date' => now()->format('Y-m-d'),
            'due_date' => now()->addDays(2)->format('Y-m-d'),
            'customer_name' => 'Fresh Client',
            'customer_email' => 'fresh@example.com',
            'customer_phone' => '08123',
            'service_name' => 'UI/UX Design',
            'package_name' => 'Basic',
            'subtotal' => 500000,
            'tax_amount' => 55000,
            'discount_amount' => 0,
            'total_amount' => 555000,
            'status' => 'PENDING',
        ]);

        // Run command: only eligible@example.com receives reminder #1
        $this->artisan('invoices:send-reminders')->assertExitCode(0);

        Mail::assertSent(InvoiceMail::class, 1);
        Mail::assertSent(InvoiceMail::class, fn (InvoiceMail $mail) => $mail->hasTo('eligible@example.com') && $mail->isReminder === true);

        $eligibleInvoice->refresh();
        $this->assertEquals(1, $eligibleInvoice->reminder_count);
        $this->assertNotNull($eligibleInvoice->last_reminded_at);

        // Immediate second run must respect cooldown (still only 1 mail total)
        $this->artisan('invoices:send-reminders')->assertExitCode(0);
        Mail::assertSent(InvoiceMail::class, 1);

        // --force ignores cooldown & initial delay for testing
        $this->artisan('invoices:send-reminders --force')->assertExitCode(0);
        Mail::assertSent(InvoiceMail::class, 3);
    }

    public function test_scheduler_registers_five_minute_invoice_reminder(): void
    {
        $schedule = app(Schedule::class);
        $events = collect($schedule->events());

        $matching = $events->first(function ($event) {
            return str_contains((string) $event->command, 'invoices:send-reminders');
        });

        $this->assertNotNull($matching);
        $this->assertEquals('*/5 * * * *', $matching->expression);
    }
}
