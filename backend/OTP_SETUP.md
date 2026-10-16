# OTP setup

Run `php artisan migrate` and `php artisan config:clear` with PHP 8.2+.

## Mobile

Create a Twilio Verify service with six-digit codes and configure backend environment variables:

```
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_VERIFY_SERVICE_SID=
```

Enable recipient countries in Verify geographic permissions. Trial recipients must be verified in the Twilio console first. Trial credits/time are limited; public customer SMS requires a paid account. https://www.twilio.com/docs/usage/trials/try-out-verify

Ten-digit Indian numbers use +91 automatically; other countries require +country code. Missing credentials return a delivery error, never a simulated success.

## Email

Configure `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS` and your SMTP provider's TLS settings. A provider's free email allowance can be used. Local `MAIL_MAILER=log` writes development codes to `storage/logs/laravel.log` without delivering email. Production rejects log/array mailers.

OTP expires after five minutes with five verification attempts, a 60-second resend cooldown and IP throttling. Successful verification consumes the challenge. Use a shared database/cache across server instances. Resending replaces the earlier challenge.

Existing email/password login remains available. Mobile login accepts new numbers and creates a customer account only after successful OTP verification. New customers can update their name in Profile. Email and phone registrations are separate identities; linking a second contact to an existing account requires an additional verified-contact flow. Real SMS/email delivery needs your provider credentials and has not been tested by automated tests.
