<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Tests\TestCase;

class OtpAuthTest extends TestCase
{
    use RefreshDatabase;

    private function challenge(array $overrides = []): string
    {
        $id = (string) Str::uuid();
        DB::table('otp_challenges')->insert(array_merge([
            'id' => $id, 'channel' => 'email', 'identifier' => 'asha@example.com',
            'purpose' => 'register', 'name' => 'Asha', 'code_hash' => Hash::make('123456'),
            'attempts' => 0, 'expires_at' => now()->addMinutes(5),
        ], $overrides));
        return $id;
    }

    public function test_email_registration_requires_code_and_cannot_be_replayed(): void
    {
        $id = $this->challenge();
        $this->postJson('/api/otp/verify', ['challenge_id' => $id, 'code' => '999999'])->assertStatus(422);
        $this->assertDatabaseCount('users', 0);
        $this->postJson('/api/otp/verify', ['challenge_id' => $id, 'code' => '123456'])
            ->assertOk()->assertJsonPath('data.user.email', 'asha@example.com')->assertJsonStructure(['data' => ['token']]);
        $this->assertNotNull(User::first()->email_verified_at);
        $this->postJson('/api/otp/verify', ['challenge_id' => $id, 'code' => '123456'])->assertStatus(422);
    }

    public function test_expired_and_locked_challenges_cannot_login(): void
    {
        foreach ([['expires_at' => now()->subSecond()], ['attempts' => 5]] as $state) {
            $id = $this->challenge($state);
            $this->postJson('/api/otp/verify', ['challenge_id' => $id, 'code' => '123456'])->assertStatus(422);
        }
        $this->assertDatabaseCount('personal_access_tokens', 0);
    }

    public function test_existing_user_can_login_but_blocked_user_cannot(): void
    {
        $user = User::factory()->create(['email' => 'asha@example.com']);
        $id = $this->challenge(['purpose' => 'login']);
        $this->postJson('/api/otp/verify', ['challenge_id' => $id, 'code' => '123456'])
            ->assertOk()->assertJsonPath('data.user.id', $user->id);
        $user->update(['status' => User::STATUS_BLOCKED]);
        $id = $this->challenge(['purpose' => 'login']);
        $this->postJson('/api/otp/verify', ['challenge_id' => $id, 'code' => '123456'])->assertStatus(403);
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('personal_access_tokens', 1);
    }

    public function test_phone_registration_sends_msg91_code_and_checks_its_hash(): void
    {
        config(['services.msg91' => ['auth_key' => 'secret', 'flow_id' => 'flow', 'otp_variable' => 'var1']]);
        Http::fake(['*/flow/' => Http::response(['type' => 'success', 'message' => 'request-id'])]);
        $sent = $this->postJson('/api/otp/send', ['channel' => 'phone', 'identifier' => '9876543210', 'purpose' => 'register', 'name' => 'Asha'])->assertOk();
        $this->assertDatabaseCount('users', 0);
        $code = Http::recorded()[0][0]['var1'];
        $this->assertTrue(Hash::check($code, DB::table('otp_challenges')->first()->code_hash));
        $this->postJson('/api/otp/verify', ['challenge_id' => $sent->json('data.challenge_id'), 'code' => $code])
            ->assertOk()->assertJsonPath('data.user.phone', '+919876543210')->assertJsonPath('data.user.email', null);
        $this->assertNotNull(User::first()->phone_verified_at);
        Http::assertSent(fn ($request) => $request['mobiles'] === '919876543210' && $request['flow_id'] === 'flow' && $request->hasHeader('authkey', 'secret'));
        Http::assertSentCount(1);
    }

    public function test_email_delivery_does_not_create_account_and_resend_is_throttled(): void
    {
        Mail::fake();
        $payload = ['channel' => 'email', 'identifier' => 'new@example.com', 'purpose' => 'register', 'name' => 'New'];
        $this->postJson('/api/otp/send', $payload)->assertOk();
        $this->assertDatabaseCount('users', 0);
        $this->postJson('/api/otp/send', $payload)->assertStatus(429);
    }

    public function test_new_mobile_requires_correct_code_and_prevents_replay(): void
    {
        config(['services.msg91' => ['auth_key' => 'secret', 'flow_id' => 'flow', 'otp_variable' => 'var1']]);
        Http::fake(['*/flow/' => Http::response(['type' => 'success'])]);
        $sent = $this->postJson('/api/otp/send', ['channel' => 'phone', 'identifier' => '9876543210', 'purpose' => 'login'])->assertOk();
        $this->assertDatabaseCount('users', 0);
        $code = Http::recorded()[0][0]['var1'];
        $payload = ['challenge_id' => $sent->json('data.challenge_id'), 'code' => $code === '999999' ? '888888' : '999999'];
        $this->postJson('/api/otp/verify', $payload)->assertStatus(422);
        $this->assertDatabaseCount('personal_access_tokens', 0);
        $this->assertDatabaseCount('users', 0);
        $payload['code'] = $code;
        $this->postJson('/api/otp/verify', $payload)->assertOk()->assertJsonPath('data.user.phone', '+919876543210');
        $this->assertDatabaseCount('users', 1);
        $this->assertDatabaseCount('personal_access_tokens', 1);
        $this->postJson('/api/otp/verify', $payload)->assertStatus(422);
    }

    public function test_rejected_email_login_does_not_block_registration_with_a_cooldown(): void
    {
        Mail::fake();
        $payload = ['channel' => 'email', 'identifier' => 'new@example.com', 'purpose' => 'login'];
        $this->postJson('/api/otp/send', $payload)->assertStatus(422);
        $this->postJson('/api/otp/send', [...$payload, 'purpose' => 'register', 'name' => 'New'])->assertOk();
        $this->postJson('/api/otp/send', [...$payload, 'purpose' => 'register', 'name' => 'New'])
            ->assertStatus(429)->assertHeader('Retry-After');
    }

    public function test_msg91_error_even_with_http_success_does_not_create_a_challenge(): void
    {
        config(['services.msg91' => ['auth_key' => 'secret', 'flow_id' => 'flow', 'otp_variable' => 'var1']]);
        Http::fake(['*/flow/' => Http::response(['type' => 'error', 'message' => 'Invalid template'])]);
        $this->postJson('/api/otp/send', ['channel' => 'phone', 'identifier' => '9876543210', 'purpose' => 'login'])
            ->assertStatus(503)->assertJsonPath('message', 'SMS could not be sent. Please try again later or contact support.');
        $this->assertDatabaseCount('otp_challenges', 0);
        $this->assertDatabaseCount('users', 0);
    }
}
