<?php

use App\Models\User;

test('admin can log in with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'admin_test@minefleet.com',
        'password' => bcrypt('password123'),
        'role' => 'ADMIN',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin_test@minefleet.com',
        'password' => 'password123',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'status',
            'message',
            'data' => ['user', 'token'],
        ]);
});

test('login fails with invalid password', function () {
    User::factory()->create([
        'email' => 'admin_test2@minefleet.com',
        'password' => bcrypt('password123'),
        'role' => 'ADMIN',
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'admin_test2@minefleet.com',
        'password' => 'wrongpassword',
    ]);

    $response->assertStatus(422);
});
