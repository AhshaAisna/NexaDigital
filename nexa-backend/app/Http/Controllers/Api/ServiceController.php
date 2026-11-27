<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServicePackage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServiceController extends Controller
{
    /**
     * Get all services with their packages.
     */
    public function index(): JsonResponse
    {
        $services = Service::with('packages')->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar layanan berhasil diambil',
            'data' => $services,
        ]);
    }

    /**
     * Get single service detail by ID (slug).
     */
    public function show(string $id): JsonResponse
    {
        $service = Service::with('packages')->find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Layanan tidak ditemukan',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Detail layanan berhasil diambil',
            'data' => $service,
        ]);
    }

    /**
     * Store newly created service (Tambah Produk Baru).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'tagline' => 'nullable|string',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric',
            'starting_price' => 'nullable|numeric',
            'sla' => 'nullable|string',
            'estimated_delivery' => 'nullable|string',
            'icon' => 'nullable|string',
            'deliverables' => 'nullable',
            'status' => 'nullable|string',
        ]);

        $name = trim($validated['name']);
        $slug = Str::slug($name);
        $uniqueId = $slug ? $slug . '-' . substr(time(), -4) : 'prod-' . time();

        $price = (float) ($validated['price'] ?? $validated['starting_price'] ?? 1500000);
        $sla = $validated['sla'] ?? $validated['estimated_delivery'] ?? '3 - 7 Hari Kerja';

        $deliverables = $request->input('deliverables');
        if (is_string($deliverables)) {
            $deliverables = array_values(array_filter(array_map('trim', explode("\n", $deliverables))));
        }
        if (!is_array($deliverables)) {
            $deliverables = [
                'Source code bersih & terstruktur',
                'Optimasi performa & responsive',
                'Dokumentasi handoff resmi studio'
            ];
        }

        $service = Service::create([
            'id' => $uniqueId,
            'name' => $name,
            'category' => $validated['category'] ?? 'Development',
            'tagline' => $validated['tagline'] ?? "Solusi {$name} profesional oleh PT Nexa Digital Solusindo.",
            'description' => $validated['description'] ?? ($validated['tagline'] ?? "Layanan {$name} dengan standar kode bersih, jaminan SLA, dan e-Faktur sah."),
            'starting_price' => $price,
            'estimated_delivery' => $sla,
            'icon' => $validated['icon'] ?? 'package',
            'packages_count' => 3,
            'deliverables' => $deliverables,
            'process' => [
                ['step' => '01', 'title' => 'Briefing & Perencanaan', 'desc' => 'Analisis kebutuhan proyek.'],
                ['step' => '02', 'title' => 'Fase Pengerjaan', 'desc' => 'Eksekusi sesuai standar studio.'],
                ['step' => '03', 'title' => 'Review & Testing', 'desc' => 'Uji mutu dan fungsionalitas.'],
                ['step' => '04', 'title' => 'Serah Terima (Handoff)', 'desc' => 'Penyerahan file master dan repositori.']
            ],
        ]);

        // Buat 3 paket standar untuk layanan ini
        ServicePackage::create([
            'service_id' => $uniqueId,
            'package_code' => 'basic',
            'name' => 'Basic Starter',
            'price' => round($price * 0.7),
            'delivery_time' => $sla,
            'revisions' => '2x Revisi',
            'screens' => 'Modul Esensial',
            'features' => array_slice($deliverables, 0, 3),
            'not_included' => ['Dukungan SLA 24/7'],
            'is_recommended' => false,
        ]);

        ServicePackage::create([
            'service_id' => $uniqueId,
            'package_code' => 'standard',
            'name' => 'Standard Package',
            'price' => $price,
            'delivery_time' => $sla,
            'revisions' => '3x Revisi',
            'screens' => 'Cakupan Penuh',
            'features' => $deliverables,
            'not_included' => [],
            'is_recommended' => true,
        ]);

        ServicePackage::create([
            'service_id' => $uniqueId,
            'package_code' => 'enterprise',
            'name' => 'Premium Dedicated SLA',
            'price' => round($price * 1.5),
            'delivery_time' => 'Prioritas Tertinggi',
            'revisions' => 'Revisi Bebas',
            'screens' => 'Lengkap & Dedikasi',
            'features' => array_merge($deliverables, ['Dedicated Tech Lead & Fast Response < 1 Jam']),
            'not_included' => [],
            'is_recommended' => false,
        ]);

        $service->load('packages');

        return response()->json([
            'success' => true,
            'message' => "Produk jasa '{$service->name}' berhasil ditambahkan ke database backend!",
            'data' => $service,
        ], 201);
    }

    /**
     * Update existing service.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Layanan tidak ditemukan',
            ], 404);
        }

        $service->update($request->only([
            'name',
            'category',
            'tagline',
            'description',
            'starting_price',
            'estimated_delivery',
            'icon',
            'deliverables'
        ]));

        $service->load('packages');

        return response()->json([
            'success' => true,
            'message' => 'Informasi layanan berhasil diperbarui',
            'data' => $service,
        ]);
    }

    /**
     * Delete service.
     */
    public function destroy(string $id): JsonResponse
    {
        $service = Service::find($id);

        if (!$service) {
            return response()->json([
                'success' => false,
                'message' => 'Layanan tidak ditemukan',
            ], 404);
        }

        $service->packages()->delete();
        $service->delete();

        return response()->json([
            'success' => true,
            'message' => "Layanan '{$service->name}' berhasil dihapus dari database",
        ]);
    }
}
