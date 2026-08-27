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
        Schema::table('appointments', function (Blueprint $table) {
            $table->index('status');
            $table->index(['doctor_id', 'start_time']);
        });

        Schema::table('consultations', function (Blueprint $table) {
            $table->index(['doctor_id', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['doctor_id', 'start_time']);
        });

        Schema::table('consultations', function (Blueprint $table) {
            $table->dropIndex(['doctor_id', 'created_at']);
        });
    }
};
