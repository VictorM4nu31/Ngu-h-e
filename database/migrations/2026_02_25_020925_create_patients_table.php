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
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            // Identificación y Contacto
            $table->string('full_name');
            $table->string('document_id')->unique()->nullable(); // DNI/CURP/etc
            $table->date('birth_date')->nullable();
            $table->enum('gender', ['male', 'female', 'other'])->nullable();
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->text('address')->nullable();

            // Datos Médicos
            $table->text('medical_antecedents')->nullable();
            $table->text('allergies')->nullable();
            $table->text('chronic_diseases')->nullable();
            $table->text('current_medication')->nullable();
            $table->text('notes')->nullable();

            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};
