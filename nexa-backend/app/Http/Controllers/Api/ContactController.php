<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ContactMessage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ContactController extends Controller
{
    /**
     * Get all contact inquiries (admin).
     */
    public function index(): JsonResponse
    {
        $messages = ContactMessage::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar pesan kontak berhasil diambil',
            'data' => $messages,
        ]);
    }

    /**
     * Store a new contact message from Contact form.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'service_interest' => 'nullable|string|max:255',
            'budget_range' => 'nullable|string|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi pesan kontak gagal',
                'errors' => $validator->errors(),
            ], 422);
        }

        $contact = ContactMessage::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Terima kasih! Pesan Anda telah berhasil terkirim ke tim Nexa Digital.',
            'data' => $contact,
        ], 201);
    }
}
