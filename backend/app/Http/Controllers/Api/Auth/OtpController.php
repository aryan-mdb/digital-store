<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Referral\ReferralService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OtpController extends Controller
{
    use ApiResponse;

    public function send(Request $request)
    {
        $data = $request->validate([
            'channel' => 'required|in:email,phone',
            'identifier' => 'required|string|max:255',
            'purpose' => 'required|in:login,register',
            'name' => 'required_if:purpose,register|nullable|string|max:255',
            'referral_code' => 'nullable|string|max:50',
        ]);
        $identifier = $data['channel'] === 'email'
            ? Str::lower(trim($data['identifier']))
            : preg_replace('/[\s()\-]/', '', trim($data['identifier']));
        if ($data['channel'] === 'phone' && preg_match('/^[6-9]\d{9}$/', $identifier)) {
            $identifier = '+91'.$identifier;
        }
        validator(['identifier' => $identifier], ['identifier' => $data['channel'] === 'email'
            ? 'required|email|max:255' : ['required', 'regex:/^\+[1-9]\d{7,14}$/']])->validate();

        $user = User::withTrashed()->where($data['channel'], $identifier)->first();
        if ($user && ($user->trashed() || ! $user->isActive())) {
            return $this->error('This account is unavailable. Please contact support.', null, 403);
        }
        if ($data['purpose'] === 'register' && $user) {
            throw ValidationException::withMessages(['identifier' => 'An account already exists. Go to Sign in and request an OTP.']);
        }
        if ($data['purpose'] === 'login' && ! $user) {
            if ($data['channel'] === 'email') {
                throw ValidationException::withMessages(['identifier' => 'No account found for this email. Please create an account first.']);
            }
            // A verified mobile number can create a customer account directly
            // from the login screen. Never create or merge before verification.
            $data['purpose'] = 'register';
            $data['name'] = 'Customer';
        }
        $key = 'otp-send:'.hash('sha256', $data['channel'].$identifier);
        if (! RateLimiter::attempt($key, 1, fn () => true, 60)) {
            $seconds = max(1, RateLimiter::availableIn($key));
            return $this->error("Please wait {$seconds} seconds before requesting another OTP.", null, 429)
                ->header('Retry-After', (string) $seconds);
        }

        $id = (string) Str::uuid();
        $code = (string) random_int(100000, 999999);
        $sid = null;
        try {
            if ($data['channel'] === 'phone') {
                $response = $this->twilio('Verifications', ['To' => $identifier, 'Channel' => 'sms']);
                if (! $response->successful() || $response->json('status') !== 'pending' || ! $response->json('sid')) {
                    $message = match ((int) $response->json('code')) {
                        21608 => 'This number is not enabled for SMS on our trial account. Contact support to enable your number.',
                        21408, 60605 => 'SMS delivery is not enabled for this country. Please contact support.',
                        60203 => 'Too many SMS requests. Please wait a few minutes before trying again.',
                        default => 'SMS could not be sent. Please try again later or contact support.',
                    };
                    return $this->error($message, null, 503);
                }
                $sid = $response->json('sid');
            } else {
                if (app()->isProduction() && in_array(config('mail.default'), ['log', 'array'])) {
                    return $this->error('Email delivery is not configured. Contact support.', null, 503);
                }
                Mail::raw("Your ".config('app.name')." verification code is {$code}. It expires in 5 minutes. Do not share this code.",
                    fn ($message) => $message->to($identifier)->subject('Your sign-in verification code'));
            }
        } catch (\Throwable $exception) {
            // Never log provider requests or plaintext codes.
            return $this->error('OTP delivery is unavailable. Please try again later.', null, 503);
        }
        DB::table('otp_challenges')->where('expires_at', '<', now())->delete();
        DB::table('otp_challenges')->where('identifier', $identifier)->where('channel', $data['channel'])->delete();
        DB::table('otp_challenges')->insert([
            'id' => $id, 'channel' => $data['channel'], 'identifier' => $identifier,
            'purpose' => $data['purpose'], 'name' => $data['name'] ?? null,
            'referral_code' => $data['referral_code'] ?? null,
            'code_hash' => $data['channel'] === 'email' ? Hash::make($code) : null,
            'provider_sid' => $sid, 'attempts' => 0, 'expires_at' => now()->addMinutes(5),
        ]);
        return $this->success(['challenge_id' => $id, 'expires_in' => 300, 'resend_after' => 60],
            $data['channel'] === 'phone' ? 'OTP requested. Check your SMS inbox; delivery can take a minute.' : 'OTP sent. Check your email inbox and spam folder.');
    }

    public function verify(Request $request, ReferralService $referrals)
    {
        $data = $request->validate(['challenge_id' => 'required|uuid', 'code' => 'required|string|regex:/^\d{6}$/']);
        return DB::transaction(function () use ($data, $referrals) {
            $challenge = DB::table('otp_challenges')->where('id', $data['challenge_id'])->lockForUpdate()->first();
            if (! $challenge || now()->gte($challenge->expires_at) || $challenge->attempts >= 5) {
                return $this->error('OTP expired or unavailable. Request a new code.', null, 422);
            }
            DB::table('otp_challenges')->where('id', $challenge->id)->increment('attempts');
            try {
                $valid = $challenge->channel === 'email'
                    ? Hash::check($data['code'], $challenge->code_hash)
                    : (($response = $this->twilio('VerificationCheck', [
                        'VerificationSid' => $challenge->provider_sid, 'Code' => $data['code'],
                    ]))->successful() && $response->json('status') === 'approved');
            } catch (\Throwable $exception) {
                return $this->error('Verification is unavailable. Please try again later.', null, 503);
            }
            if (! $valid) {
                return $this->error('Invalid OTP. Request a new code after 5 failed attempts.', null, 422);
            }
            DB::table('otp_challenges')->where('id', $challenge->id)->delete();
            $user = User::withTrashed()->where($challenge->channel, $challenge->identifier)->first();
            if ($challenge->purpose === 'register') {
                if ($user) {
                    return $this->error('Account already exists. Please sign in.', null, 422);
                }
                $user = User::create([
                    'name' => $challenge->name, $challenge->channel => $challenge->identifier,
                    'password' => Hash::make(Str::random(64)),
                    'role' => User::ROLE_BASIC_USER, 'status' => User::STATUS_ACTIVE,
                    'referral_code' => $referrals->generateUniqueCode(),
                ]);
                $referrals->attachReferral($user, $challenge->referral_code);
            }
            if (! $user || $user->trashed() || ! $user->isActive()) {
                return $this->error('Account unavailable. Contact support.', null, 403);
            }
            $user->forceFill([$challenge->channel.'_verified_at' => now()])->save();
            return $this->success([
                'user' => new UserResource($user), 'token' => $user->createToken('api')->plainTextToken,
            ], 'Verification successful');
        });
    }

    private function twilio(string $path, array $payload)
    {
        $settings = config('services.twilio');
        if (empty($settings['account_sid']) || empty($settings['auth_token']) || empty($settings['verify_service_sid'])) {
            throw new \RuntimeException('SMS provider is not configured.');
        }
        return Http::asForm()->withBasicAuth($settings['account_sid'], $settings['auth_token'])->timeout(15)
            ->post('https://verify.twilio.com/v2/Services/'.rawurlencode($settings['verify_service_sid']).'/'.$path, $payload);
    }
}
