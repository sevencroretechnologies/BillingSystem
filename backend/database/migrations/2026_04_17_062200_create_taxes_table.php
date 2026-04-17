<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Single-row settings table. The invoice pipeline reads the first
        // row to get the current SGST / CGST percentages.
        Schema::create('taxes', function (Blueprint $table) {
            $table->id();
            $table->decimal('sgst', 5, 2)->default(0);
            $table->decimal('cgst', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('taxes');
    }
};
