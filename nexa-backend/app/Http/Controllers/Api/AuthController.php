<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    /**
     * Pendaftaran Akun Klien Baru
     */
    public function registerClient(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'company' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
        ], [
            'name.required' => 'Nama lengkap wajib diisi.',
            'email.required' => 'Email aktif wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'email.unique' => 'Email ini sudah terdaftar di sistem Nexa Digital.',
            'password.required' => 'Kata sandi wajib diisi.',
            'password.min' => 'Kata sandi minimal 6 karakter.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'client',
            'company' => $request->company,
            'phone' => $request->phone,
            'avatar' => 'https://ui-avatars.com/api/?name=' . urlencode($request->name) . '&background=F97316&color=fff',
        ]);

        $token = $user->createToken('nexa-client-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registrasi akun klien berhasil! Selamat datang di Nexa Digital.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company' => $user->company,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Login Portal Klien (Client Login)
     */
    public function loginClient(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kombinasi email atau kata sandi tidak cocok.',
            ], 401);
        }

        // Pastikan hanya role client yang dapat masuk melalui portal login klien
        if ($user->role !== 'client') {
            return response()->json([
                'success' => false,
                'message' => 'Akses Ditolak: Akun ini adalah akun Administrator. Silakan masuk melalui Portal Login Admin.',
            ], 403);
        }

        $token = $user->createToken('nexa-client-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil! Selamat datang kembali, ' . $user->name . '.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company' => $user->company,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ], 200);
    }

    /**
     * Login Khusus Administrator (Admin Console)
     */
    public function loginAdmin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'Email administrator wajib diisi.',
            'password.required' => 'Kata sandi administrator wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kredensial administrator tidak valid.',
            ], 401);
        }

        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Akses Ditolak: Akun ini tidak memiliki hak akses Administrator untuk mengelola website.',
            ], 403);
        }

        $token = $user->createToken('nexa-admin-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Autentikasi Administrator berhasil! Selamat datang di Nexa Management Console.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company' => $user->company,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ], 200);
    }

    /**
     * Login Khusus Pegawai / Staf Operasional
     */
    public function loginPegawai(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ], [
            'email.required' => 'Email pegawai wajib diisi.',
            'password.required' => 'Kata sandi pegawai wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kredensial pegawai tidak valid.',
            ], 401);
        }

        if ($user->role !== 'pegawai') {
            return response()->json([
                'success' => false,
                'message' => 'Akses Ditolak: Akun ini bukan akun Pegawai / Staf Operasional.',
            ], 403);
        }

        $token = $user->createToken('nexa-pegawai-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Autentikasi Pegawai berhasil! Selamat bekerja di Workspace Nexa Digital.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company' => $user->company,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ], 200);
    }

    /**
     * Login Terpadu (Unified Login) - Otomatis mendeteksi role atau memvalidasi role yang dipilih
     */
    public function loginUnified(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'role' => 'nullable|string',
        ], [
            'email.required' => 'Email wajib diisi.',
            'email.email' => 'Format email tidak valid.',
            'password.required' => 'Kata sandi wajib diisi.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Kombinasi email atau kata sandi tidak cocok.',
            ], 401);
        }

        // Jika user memilih peran tertentu (bukan 'auto'), pastikan akun cocok dengan peran tersebut
        $requestedRole = $request->input('role');
        if (!empty($requestedRole) && $requestedRole !== 'auto' && $requestedRole !== $user->role) {
            $roleLabel = match ($user->role) {
                'admin' => 'Administrator Utama',
                'pegawai' => 'Pegawai / Staf Operasional',
                default => 'Klien'
            };
            return response()->json([
                'success' => false,
                'message' => "Akses Ditolak: Akun ini terdaftar sebagai {$roleLabel}.",
                'actual_role' => $user->role,
            ], 403);
        }

        $tokenName = match ($user->role) {
            'admin' => 'nexa-admin-token',
            'pegawai' => 'nexa-pegawai-token',
            default => 'nexa-client-token'
        };

        $token = $user->createToken($tokenName)->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login berhasil! Selamat datang di Nexa Digital.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company' => $user->company,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
        ], 200);
    }

    /**
     * Cek Profile User Saat Ini
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated',
            ], 401);
        }

        return response()->json([
            'success' => true,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'company' => $user->company,
                'phone' => $user->phone,
                'avatar' => $user->avatar,
            ],
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request)
    {
        if ($request->user()) {
            $request->user()->currentAccessToken()?->delete();
        }

        return response()->json([
            'success' => true,
            'message' => 'Anda telah berhasil keluar dari sesi ini.',
        ]);
    }

    /**
     * Get all clients from database for selection
     */
    public function getClients(): JsonResponse
    {
        $clients = User::where('role', 'client')
            ->orWhereNull('role')
            ->select('id', 'name', 'email', 'company', 'phone', 'role')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar klien berhasil diambil',
            'data' => $clients,
        ]);
    }

    /**
     * Get all users from database
     */
    public function getUsers(): JsonResponse
    {
        $users = User::select('id', 'name', 'email', 'company', 'phone', 'role')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Daftar seluruh pengguna berhasil diambil',
            'data' => $users,
        ]);
    }
}
