<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    /**
     * Get aggregate statistics for Admin Dashboard.
     */
    public function stats(): JsonResponse
    {
        $totalOrders = Order::count();
        $activeProjects = Order::whereNotIn('project_status', ['Selesai', 'Dibatalkan'])->count();
        $completedProjects = Order::where('project_status', 'Selesai')->count();
        $totalRevenue = (float) Order::where('payment_status', 'PAID')->sum('total');

        $recentOrders = Order::with('invoice')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Statistik dashboard berhasil diambil',
            'data' => [
                'totalOrders' => $totalOrders,
                'activeProjects' => $activeProjects,
                'completedProjects' => $completedProjects,
                'totalRevenue' => $totalRevenue,
                'recentOrders' => $recentOrders,
            ],
        ]);
    }
}
