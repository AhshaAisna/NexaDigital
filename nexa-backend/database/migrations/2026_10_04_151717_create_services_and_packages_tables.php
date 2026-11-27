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
        Schema::create('services', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'ui-ux-design'
            $table->string('name');
            $table->string('category');
            $table->string('tagline');
            $table->text('description');
            $table->decimal('starting_price', 15, 2)->default(0);
            $table->string('estimated_delivery');
            $table->string('icon')->default('palette');
            $table->integer('packages_count')->default(3);
            $table->json('deliverables')->nullable();
            $table->json('process')->nullable();
            $table->timestamps();
        });

        Schema::create('service_packages', function (Blueprint $table) {
            $table->id();
            $table->string('service_id');
            $table->foreign('service_id')->references('id')->on('services')->onDelete('cascade');
            $table->string('package_code'); // 'basic', 'standard', 'enterprise'
            $table->string('name');
            $table->decimal('price', 15, 2)->default(0);
            $table->string('delivery_time');
            $table->string('revisions');
            $table->string('screens')->nullable();
            $table->json('features')->nullable();
            $table->json('not_included')->nullable();
            $table->boolean('is_recommended')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_packages');
        Schema::dropIfExists('services');
    }
};
