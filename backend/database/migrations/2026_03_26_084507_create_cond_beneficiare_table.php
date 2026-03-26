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
        Schema::create('cond_beneficiare', function (Blueprint $table) {
            $table->id();
            $table->foreignId('condition_id')
            ->constrained()
            ->cascadeOnDelete();
            $table->foreignId('beneficiare_id')
            ->constrained()
            ->cascadeOnDelete();
            $table->jsonb("condition");
            $table->boolean("status");
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('cond_beneficiare');
    }
};
