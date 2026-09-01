<?php

namespace App\Services\Wallet;

use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class WalletService
{
    /**
     * Get (or lazily create) the wallet for a user.
     */
    public function walletFor(User $user): Wallet
    {
        return Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0, 'currency' => 'USD']
        );
    }

    /**
     * Add funds to a user's wallet and record the transaction.
     * Locks the wallet row so concurrent credits/debits can't race.
     */
    public function credit(User $user, float $amount, string $source, ?int $sourceId, string $description): WalletTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Credit amount must be positive.');
        }

        return DB::transaction(function () use ($user, $amount, $source, $sourceId, $description) {
            $wallet = Wallet::lockForUpdate()->firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'currency' => 'USD']
            );

            $newBalance = round((float) $wallet->balance + $amount, 2);
            $wallet->update(['balance' => $newBalance]);

            return $wallet->transactions()->create([
                'user_id' => $user->id,
                'type' => WalletTransaction::TYPE_CREDIT,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'source' => $source,
                'source_id' => $sourceId,
                'description' => $description,
            ]);
        });
    }

    /**
     * Deduct funds from a user's wallet and record the transaction. Throws
     * if the wallet doesn't have enough balance.
     */
    public function debit(User $user, float $amount, string $source, ?int $sourceId, string $description): WalletTransaction
    {
        if ($amount <= 0) {
            throw new \InvalidArgumentException('Debit amount must be positive.');
        }

        return DB::transaction(function () use ($user, $amount, $source, $sourceId, $description) {
            $wallet = Wallet::lockForUpdate()->firstOrCreate(
                ['user_id' => $user->id],
                ['balance' => 0, 'currency' => 'USD']
            );

            if ((float) $wallet->balance < $amount) {
                throw ValidationException::withMessages([
                    'wallet' => 'Insufficient wallet balance.',
                ]);
            }

            $newBalance = round((float) $wallet->balance - $amount, 2);
            $wallet->update(['balance' => $newBalance]);

            return $wallet->transactions()->create([
                'user_id' => $user->id,
                'type' => WalletTransaction::TYPE_DEBIT,
                'amount' => $amount,
                'balance_after' => $newBalance,
                'source' => $source,
                'source_id' => $sourceId,
                'description' => $description,
            ]);
        });
    }
}
