<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\CryptoPaymentResource;
use App\Models\CryptoPayment;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    use ApiResponse;

    /**
     * All crypto payments / transactions — the admin "Payments" & "Transactions" pages.
     */
    public function index(Request $request)
    {
        $query = CryptoPayment::with('order', 'user');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('cryptocurrency')) {
            $query->where('cryptocurrency', $request->string('cryptocurrency'));
        }

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($q) use ($term) {
                $q->where('transaction_id', 'like', "%{$term}%")
                    ->orWhereHas('order', fn ($o) => $o->where('order_number', 'like', "%{$term}%"));
            });
        }

        $payments = $query->latest()->paginate($request->integer('per_page', 15));

        return $this->success($payments->through(fn ($p) => new CryptoPaymentResource($p)), 'OK');
    }

    public function show(CryptoPayment $payment)
    {
        $payment->load('order.items.product', 'user');

        return $this->success(new CryptoPaymentResource($payment), 'OK');
    }
}
