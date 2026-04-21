<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('company', function (Blueprint $table) {
            $table->string('whatsapp_no')->nullable()->after('phone');
            $table->string('signature')->nullable()->after('pan'); // stores uploaded image path
        });
    }

    public function down(): void
    {
        Schema::table('company', function (Blueprint $table) {
            $table->dropColumn(['whatsapp_no', 'signature']);
        });
    }
};
