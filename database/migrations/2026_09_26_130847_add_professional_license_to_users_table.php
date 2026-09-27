<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Cédula profesional, required for doctors because it is printed on
     * every prescription they issue. Nullable: receptionists and admins do
     * not hold one.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('professional_license', 32)->nullable()->after('email');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('professional_license');
        });
    }
};
