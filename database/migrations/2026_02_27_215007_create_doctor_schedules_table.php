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
        Schema::create('doctor_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('day_of_week'); // 0 = Domingo, 1 = Lunes, etc.
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->boolean('is_working')->default(false);
            $table->timestamps();

            $table->unique(['user_id', 'day_of_week']); // Un doctor tiene solo un horario por día de la semana
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('doctor_schedules');
    }
};
