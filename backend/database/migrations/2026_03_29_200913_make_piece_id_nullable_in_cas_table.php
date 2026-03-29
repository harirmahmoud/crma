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
        Schema::table('cas', function (Blueprint $table) {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE cas ALTER COLUMN piece_id DROP NOT NULL');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cas', function (Blueprint $table) {
            \Illuminate\Support\Facades\DB::statement('ALTER TABLE cas ALTER COLUMN piece_id SET NOT NULL');
        });
    }
};
