<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Concerns\ApiResponse;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Http\Resources\UserResource;
use App\Models\CryptoPayment;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    public function __invoke()
    {
        $cards = [
            'total_users' => User::where('role', User::ROLE_BASIC_USER)->count(),
            'active_users' => User::where('role', User::ROLE_BASIC_USER)->where('status', User::STATUS_ACTIVE)->count(),
            'total_products' => Product::count(),
            'total_categories' => \App\Models\Category::count(),
            'total_orders' => Order::count(),
            'completed_orders' => Order::where('status', Order::STATUS_COMPLETED)->count(),
            'pending_payments' => Order::where('payment_status', Order::PAYMENT_PENDING)->count(),
            'total_revenue' => (float) Order::where('payment_status', Order::PAYMENT_PAID)->sum('total_amount'),
        ];

        $recentOrders = Order::with('user', 'items.product')->latest()->limit(5)->get();
        $recentUsers = User::where('role', User::ROLE_BASIC_USER)->latest()->limit(5)->get();
        $recentPayments = CryptoPayment::with('order', 'user')->latest()->limit(5)->get();

        $bestSelling = Product::query()
            ->select('products.id', 'products.name', 'products.thumbnail')
            ->join('order_items', 'order_items.product_id', '=', 'products.id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.payment_status', Order::PAYMENT_PAID)
            ->groupBy('products.id', 'products.name', 'products.thumbnail')
            ->orderByRaw('COUNT(order_items.id) desc')
            ->limit(5)
            ->selectRaw('COUNT(order_items.id) as sales_count, SUM(order_items.price) as revenue')
            ->get();

        $salesByCategory = DB::table('order_items')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->join('products', 'products.id', '=', 'order_items.product_id')
            ->join('categories', 'categories.id', '=', 'products.category_id')
            ->where('orders.payment_status', Order::PAYMENT_PAID)
            ->groupBy('categories.id', 'categories.name')
            ->selectRaw('categories.id, categories.name, COUNT(order_items.id) as sales_count, SUM(order_items.price) as revenue')
            ->orderByDesc('revenue')
            ->get();

        return $this->success([
            'cards' => $cards,
            'recent_orders' => OrderResource::collection($recentOrders),
            'recent_users' => UserResource::collection($recentUsers),
            'recent_payments' => $recentPayments->map(fn ($p) => [
                'id' => $p->id,
                'order_number' => $p->order?->order_number,
                'user' => $p->user?->name,
                'amount' => (float) $p->amount,
                'cryptocurrency' => $p->cryptocurrency,
                'status' => $p->status,
                'created_at' => $p->created_at,
            ]),
            'best_selling_products' => $bestSelling,
            'sales_by_category' => $salesByCategory,
        ], 'OK');
    }
}
