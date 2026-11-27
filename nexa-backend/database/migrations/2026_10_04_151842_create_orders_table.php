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
        Schema::create('orders', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'NXD-2026-081'
            $table->string('invoice_number')->nullable();
            $table->string('service_id');
            $table->string('service_name');
            $table->string('package_id');
            $table->string('package_name');
            $table->string('customer_name');
            $table->string('customer_email');
            $table->string('customer_phone');
            $table->string('customer_company')->nullable();
            $table->date('order_date');
            $table->date('deadline');
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('total', 15, 2)->default(0);
            $table->string('payment_method')->default('Bank Transfer BCA');
            $table->string('payment_status')->default('PENDING'); // 'PENDING', 'PAID'
            $table->string('project_status')->default('Sedang Dikerjakan'); // 'pending', 'Sedang Dikerjakan', 'Tahap Revisi', 'Selesai', 'Dibatalkan'
            $table->integer('progress')->default(0);
            $table->string('assigned_team')->nullable();
            $table->json('requirements')->nullable();
            $table->json('timeline')->nullable();
            $table->json('messages')->nullable();
            $table->json('files')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
