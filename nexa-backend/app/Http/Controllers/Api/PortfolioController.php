<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PortfolioProject;
use Illuminate\Http\JsonResponse;

class PortfolioController extends Controller
{
    /**
     * Get all portfolio projects.
     */
    public function index(): JsonResponse
    {
        $projects = PortfolioProject::orderBy('year', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar portofolio berhasil diambil',
            'data' => $projects,
        ]);
    }

    /**
     * Get single portfolio project by ID (slug).
     */
    public function show(string $id): JsonResponse
    {
        $project = PortfolioProject::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => "Proyek portofolio {$id} tidak ditemukan",
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail portofolio berhasil diambil',
            'data' => $project,
        ]);
    }
}
