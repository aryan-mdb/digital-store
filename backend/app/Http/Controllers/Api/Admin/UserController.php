<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = User::withCount('orders');

        if ($request->filled('role')) {
            $query->where('role', $request->string('role'));
        }

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        if ($request->filled('search')) {
            $term = $request->string('search');
            $query->where(function ($q) use ($term) {
                $q->where('name', 'like', "%{$term}%")->orWhere('email', 'like', "%{$term}%");
            });
        }

        $users = $query->latest()->paginate($request->integer('per_page', 15));

        return $this->success($users->through(fn ($u) => new UserResource($u)), 'OK');
    }

    public function show(User $user)
    {
        $user->loadCount('orders');

        return $this->success(new UserResource($user), 'OK');
    }

    public function orders(Request $request, User $user)
    {
        $orders = $user->orders()->with('items.product', 'cryptoPayment')->latest()
            ->paginate($request->integer('per_page', 10));

        return $this->success($orders->through(fn ($o) => new OrderResource($o)), 'OK');
    }

    public function update(UpdateUserRequest $request, User $user)
    {
        $changesRoleOrStatus = $request->filled('role') || $request->filled('status');

        if ($changesRoleOrStatus && ! $request->user()->can('modifyRoleOrStatus', $user)) {
            return $this->error('The primary admin account cannot be modified.', null, 403);
        }

        $user->update($request->validated());

        return $this->success(new UserResource($user), 'User updated successfully');
    }

    public function destroy(Request $request, User $user)
    {
        if (! $request->user()->can('delete', $user)) {
            return $this->error('This account cannot be deleted.', null, 403);
        }

        $user->delete();

        return $this->success(null, 'User deleted successfully');
    }
}
