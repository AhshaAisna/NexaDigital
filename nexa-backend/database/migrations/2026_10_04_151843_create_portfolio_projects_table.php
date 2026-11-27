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
        Schema::create('portfolio_projects', function (Blueprint $table) {
            $table->string('id')->primary(); // e.g. 'freshmart-pos'
            $table->string('title');
            $table->string('category');
            $table->string('client');
            $table->string('year');
            $table->text('description');
            $table->json('metrics')->nullable();
            $table->json('technologies')->nullable();
            $table->json('deliverables')->nullable();
            $table->string('image_url')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('portfolio_projects');
    }
};
