<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\CryptoPaymentResource;
use App\Models\CryptoPayment;
use App\Models\Order;
use App\Services\Payment\CryptoPaymentServiceInterface;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    use ApiResponse;
    use AuthorizesRequests;

    public function __construct(private readonly CryptoPaymentServiceInterface $payments)
    {
    }

    /**
     * Create (or re-fetch the still-valid) crypto invoice for an order the
     * authenticated user owns.
     */
    public function create(Request $request, Order $order)
    {
        $this->authorize('view', $order);

        if ($order->isPaid()) {
            return $this->error('This order has already been paid.', null, 409);
        }

        $existing = $order->cryptoPayments()
            ->where('status', CryptoPayment::STATUS_PENDING)
            ->where('expires_at', '>', now())
            ->whereNotNull('transaction_id')
            ->latest()
            ->first();

        try {
            $payment = $existing ?? $this->payments->createPayment($order);
        } catch (\RuntimeException $e) {
            return $this->error($e->getMessage(), null, 502);
        }

        return $this->success(new CryptoPaymentResource($payment), 'Crypto payment created', 201);
    }

    public function show(Request $request, CryptoPayment $payment)
    {
        $this->authorize('view', $payment->order);

        if ($payment->isExpired()) {
            $payment->update(['status' => CryptoPayment::STATUS_EXPIRED]);
        } elseif ($payment->status === CryptoPayment::STATUS_PENDING) {
            // Fallback path in case the webhook hasn't arrived yet — never
            // trust a status the frontend sends, only what the provider says.
            $payment = $this->payments->refreshStatus($payment);
        }

        return $this->success(new CryptoPaymentResource($payment), 'OK');
    }

    /**
     * Public webhook endpoint — no auth:sanctum, protected only by the
     * provider's signature header. Must stay outside CSRF/session concerns.
     */
    public function webhook(Request $request)
    {
        $signature = $request->header('X-CC-Webhook-Signature');
        $rawPayload = $request->getContent();

        if (! $this->payments->verifyWebhookSignature($rawPayload, $signature)) {
            Log::warning('Rejected crypto webhook with invalid signature', [
                'ip' => $request->ip(),
            ]);

            return $this->error('Invalid signature', null, 401);
        }

        $payment = $this->payments->handleWebhookPayload($request->all());

        return $this->success(['processed' => $payment !== null], 'Webhook received');
    }
}
