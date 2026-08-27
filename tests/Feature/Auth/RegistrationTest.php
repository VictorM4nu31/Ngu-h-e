<?php

test('registration screen can be rendered', function () {
    $response = $this->get(route('register'));

    $response->assertOk();
});

test('new users can register', function () {
    \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'patient']);

    $response = $this->post(route('register.store'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $this->assertAuthenticated();
    $response->assertRedirect(route('dashboard', absolute: false));

    $user = \App\Models\User::where('email', 'test@example.com')->firstOrFail();
    $this->assertTrue($user->hasRole('patient'));

    $this->assertDatabaseHas('patients', [
        'user_id' => $user->id,
        'full_name' => 'Test User',
        'email' => 'test@example.com',
    ]);
});
