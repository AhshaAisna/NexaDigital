<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Admin Account
        User::updateOrCreate(
            ['email' => 'admin@nexadigital.id'],
            [
                'name' => 'Administrator IT Nexa',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'company' => 'PT Nexa Digital Solusindo',
                'phone' => '+62 811-2233-4455',
                'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
            ]
        );

        // 2. Client Account 1 (Rian Hidayat)
        User::updateOrCreate(
            ['email' => 'rian.hidayat@startupkita.id'],
            [
                'name' => 'Rian Hidayat',
                'password' => Hash::make('client123'),
                'role' => 'client',
                'company' => 'PT Logistik Kita Bersama',
                'phone' => '+62 812-9988-7766',
                'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
            ]
        );

        // 3. Client Account 2 (Siti Rahmawati)
        User::updateOrCreate(
            ['email' => 'siti.rahma@freshmart.id'],
            [
                'name' => 'Siti Rahmawati',
                'password' => Hash::make('client123'),
                'role' => 'client',
                'company' => 'PT FreshMart Indonesia',
                'phone' => '+62 813-7766-5544',
                'avatar' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
            ]
        );

        // 4. Pegawai / Staf Operasional Account (Bagas Pratama)
        User::updateOrCreate(
            ['email' => 'pegawai@nexadigital.id'],
            [
                'name' => 'Bagas Pratama (Staff Operasional)',
                'password' => Hash::make('pegawai123'),
                'role' => 'pegawai',
                'company' => 'PT Nexa Digital Solusindo',
                'phone' => '+62 813-8899-0011',
                'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
            ]
        );
    }
}
