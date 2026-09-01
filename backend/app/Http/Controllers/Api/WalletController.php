<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\WalletTransactionResource;
use App\Services\Wallet\WalletService;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    use ApiResponse;

    public function __construct(private readonly WalletService $wallet)
    {
    }

    public function show(Request $request)
    {
        $wallet = $this->wallet->walletFor($request->user());

        return $this->success([
            'balance' => (float) $wallet->balance,
            'currency' => $wallet->currency,
        ], 'OK');
    }

    public function transactions(Request $request)
    {
        $wallet = $this->wallet->walletFor($request->user());

        $transactions = $wallet->transactions()
            ->latest()
            ->paginate($request->integer('per_page', 15));

        return $this->success($transactions->through(fn ($t) => new WalletTransactionResource($t)), 'OK');
    }
}
