# OTP setup

Run `php artisan migrate` and `php artisan config:clear` with PHP 8.2+.

## Mobile

Configure an approved MSG91 Flow/SMS template with a `var1` variable for the six-digit OTP:

```
MSG91_AUTH_KEY=
MSG91_FLOW_ID=
MSG91_OTP_VARIABLE=var1
```

Keep the auth key only in the server `.env`. The Flow API sends the generated code; Laravel stores only its hash and checks it locally. Complete MSG91 balance, KYC, sender and DLT/template requirements before sending live SMS. API acceptance does not guarantee delivery; check MSG91 delivery reports for failures. Existing Twilio challenges must be requested again after switching.

Ten-digit Indian numbers use +91 automatically; other countries require +country code. Missing credentials return a delivery error, never a simulated success.

## Email

Configure `MAIL_MAILER=smtp`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS` and your SMTP provider's TLS settings. A provider's free email allowance can be used. Local `MAIL_MAILER=log` writes development codes to `storage/logs/laravel.log` without delivering email. Production rejects log/array mailers.

OTP expires after five minutes with five verification attempts, a 60-second resend cooldown and IP throttling. Successful verification consumes the challenge. Use a shared database/cache across server instances. Resending replaces the earlier challenge.

Existing email/password login remains available. Mobile login accepts new numbers and creates a customer account only after successful OTP verification. New customers can update their name in Profile. Email and phone registrations are separate identities; linking a second contact to an existing account requires an additional verified-contact flow. Real SMS/email delivery needs your provider credentials and has not been tested by automated tests.
