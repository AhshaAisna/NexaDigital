<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('midtrans_order_id')->nullable()->unique()->after('payment_status');
            $table->string('snap_token')->nullable()->after('midtrans_order_id');
            $table->string('payment_url')->nullable()->after('snap_token');
            $table->string('payment_type')->nullable()->after('payment_url');
            $table->string('transaction_status')->nullable()->after('payment_type');
            $table->timestamp('paid_at')->nullable()->after('transaction_status');
            $table->json('midtrans_response')->nullable()->after('paid_at');
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->string('midtrans_order_id')->nullable()->after('status');
            $table->string('snap_token')->nullable()->after('midtrans_order_id');
            $table->string('payment_url')->nullable()->after('snap_token');
            $table->timestamp('paid_at')->nullable()->after('payment_url');
            $table->timestamp('email_sent_at')->nullable()->after('paid_at');
            $table->timestamp('last_reminded_at')->nullable()->after('email_sent_at');
            $table->unsignedInteger('reminder_count')->default(0)->after('last_reminded_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'midtrans_order_id',
                'snap_token',
                'payment_url',
                'payment_type',
                'transaction_status',
                'paid_at',
                'midtrans_response',
            ]);
        });

        Schema::table('invoices', function (Blueprint $table) {
            $table->dropColumn([
                'midtrans_order_id',
                'snap_token',
                'payment_url',
                'paid_at',
                'email_sent_at',
                'last_reminded_at',
                'reminder_count',
            ]);
        });
    }
};
