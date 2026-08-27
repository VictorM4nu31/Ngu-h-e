<?php

use App\Models\Patient;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Storage::fake('public');

    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'doctor']);
    Role::firstOrCreate(['name' => 'receptionist']);

    $admin = User::factory()->create();
    $admin->assignRole('admin');

    $this->admin = $admin;
    $this->patient = Patient::create([
        'full_name' => 'Paciente adjuntos',
        'document_id' => 'ATT-001',
        'email' => 'att@test.com',
    ]);
});

test('staff can attach an allowed document (pdf)', function () {
    $file = UploadedFile::fake()->create('rayo-x.pdf', 100, 'application/pdf');

    $this->actingAs($this->admin)
        ->post(route('patients.attachments.store', $this->patient), [
            'file' => $file,
            'label' => 'Radiografía de tórax',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('attachments', ['file_name' => 'rayo-x.pdf']);
});

test('staff cannot attach a disallowed file type (svg)', function () {
    $file = UploadedFile::fake()->create('documento.svg', 100, 'image/svg+xml');

    $this->actingAs($this->admin)
        ->post(route('patients.attachments.store', $this->patient), [
            'file' => $file,
        ])
        ->assertSessionHasErrors(['file']);

    $this->assertDatabaseMissing('attachments', ['file_name' => 'documento.svg']);
});
