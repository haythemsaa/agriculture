<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Agriculteur;
use App\Models\Acheteur;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Create Agriculteurs
        $agriculteurs = [
            [
                'user' => [
                    'first_name' => 'Ahmed',
                    'last_name' => 'Ben Ali',
                    'email' => 'ahmed@agritech.tn',
                    'phone' => '+216 20 111 111',
                    'role' => 'agriculteur',
                    'status' => 'active',
                ],
                'profile' => [
                    'farm_name' => 'Ferme Bio Ahmed',
                    'bio' => 'Producteur de fruits et légumes biologiques depuis 15 ans',
                    'experience_years' => 15,
                    'certifications' => ['bio', 'aoc'],
                    'specializations' => ['fruits', 'legumes'],
                    'farm_size' => 5.5,
                    'governorate' => 'Nabeul',
                    'delegation' => 'Hammamet',
                    'latitude' => 36.4000,
                    'longitude' => 10.6167,
                    'verification_status' => 'verified',
                    'verified_at' => now(),
                    'rating_average' => 4.8,
                    'rating_count' => 45,
                    'is_premium' => true,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Fatma',
                    'last_name' => 'Trabelsi',
                    'email' => 'fatma@agritech.tn',
                    'phone' => '+216 20 222 222',
                    'role' => 'agriculteur',
                    'status' => 'active',
                ],
                'profile' => [
                    'farm_name' => 'Domaine Trabelsi',
                    'bio' => 'Spécialisée dans l\'huile d\'olive extra vierge',
                    'experience_years' => 20,
                    'certifications' => ['bio', 'halal'],
                    'specializations' => ['huile-olive'],
                    'farm_size' => 12.0,
                    'governorate' => 'Sfax',
                    'delegation' => 'Sfax Ville',
                    'latitude' => 34.7406,
                    'longitude' => 10.7603,
                    'verification_status' => 'verified',
                    'verified_at' => now(),
                    'rating_average' => 4.9,
                    'rating_count' => 67,
                    'is_premium' => true,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Mohamed',
                    'last_name' => 'Hammami',
                    'email' => 'mohamed@agritech.tn',
                    'phone' => '+216 20 333 333',
                    'role' => 'agriculteur',
                    'status' => 'active',
                ],
                'profile' => [
                    'farm_name' => 'Oasis Hammami',
                    'bio' => 'Production de dattes Deglet Nour de qualité supérieure',
                    'experience_years' => 25,
                    'certifications' => ['aoc'],
                    'specializations' => ['dattes'],
                    'farm_size' => 8.0,
                    'governorate' => 'Tozeur',
                    'delegation' => 'Tozeur',
                    'latitude' => 33.9197,
                    'longitude' => 8.1335,
                    'verification_status' => 'verified',
                    'verified_at' => now(),
                    'rating_average' => 4.7,
                    'rating_count' => 38,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Leila',
                    'last_name' => 'Mansour',
                    'email' => 'leila@agritech.tn',
                    'phone' => '+216 20 444 444',
                    'role' => 'agriculteur',
                    'status' => 'active',
                ],
                'profile' => [
                    'farm_name' => 'Ruche d\'Or',
                    'bio' => 'Apiculture traditionnelle et production de miel naturel',
                    'experience_years' => 10,
                    'certifications' => ['bio'],
                    'specializations' => ['miel'],
                    'farm_size' => 3.0,
                    'governorate' => 'Bizerte',
                    'delegation' => 'Bizerte Nord',
                    'latitude' => 37.2744,
                    'longitude' => 9.8739,
                    'verification_status' => 'verified',
                    'verified_at' => now(),
                    'rating_average' => 4.9,
                    'rating_count' => 52,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Karim',
                    'last_name' => 'Sassi',
                    'email' => 'karim@agritech.tn',
                    'phone' => '+216 20 555 555',
                    'role' => 'agriculteur',
                    'status' => 'active',
                ],
                'profile' => [
                    'farm_name' => 'Ferme Sassi',
                    'bio' => 'Élevage et production laitière artisanale',
                    'experience_years' => 12,
                    'certifications' => ['halal'],
                    'specializations' => ['produits-laitiers'],
                    'farm_size' => 6.5,
                    'governorate' => 'Béja',
                    'delegation' => 'Béja Nord',
                    'latitude' => 36.7256,
                    'longitude' => 9.1817,
                    'verification_status' => 'verified',
                    'verified_at' => now(),
                    'rating_average' => 4.6,
                    'rating_count' => 31,
                ],
            ],
        ];

        foreach ($agriculteurs as $data) {
            $user = User::create([
                ...$data['user'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]);

            Agriculteur::create([
                'user_id' => $user->id,
                ...$data['profile'],
            ]);
        }

        // Create Acheteurs
        $acheteurs = [
            [
                'user' => [
                    'first_name' => 'Sarah',
                    'last_name' => 'Gharbi',
                    'email' => 'sarah@example.tn',
                    'phone' => '+216 20 666 666',
                    'role' => 'acheteur',
                    'status' => 'active',
                ],
                'profile' => [
                    'buyer_type' => 'particulier',
                    'total_spent' => 450.00,
                    'total_orders' => 12,
                    'loyalty_points' => 120,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Riadh',
                    'last_name' => 'Mejri',
                    'email' => 'riadh@example.tn',
                    'phone' => '+216 20 777 777',
                    'role' => 'acheteur',
                    'status' => 'active',
                ],
                'profile' => [
                    'buyer_type' => 'restaurant',
                    'company_name' => 'Restaurant Le Gourmet',
                    'total_spent' => 2850.00,
                    'total_orders' => 28,
                    'loyalty_points' => 580,
                ],
            ],
            [
                'user' => [
                    'first_name' => 'Sonia',
                    'last_name' => 'Bouazizi',
                    'email' => 'sonia@example.tn',
                    'phone' => '+216 20 888 888',
                    'role' => 'acheteur',
                    'status' => 'active',
                ],
                'profile' => [
                    'buyer_type' => 'particulier',
                    'total_spent' => 680.00,
                    'total_orders' => 15,
                    'loyalty_points' => 180,
                ],
            ],
        ];

        foreach ($acheteurs as $data) {
            $user = User::create([
                ...$data['user'],
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
                'phone_verified_at' => now(),
            ]);

            Acheteur::create([
                'user_id' => $user->id,
                ...$data['profile'],
            ]);
        }

        // Create Admin
        $admin = User::create([
            'first_name' => 'Admin',
            'last_name' => 'AgriTech',
            'email' => 'admin@agritech.tn',
            'phone' => '+216 20 000 000',
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active',
            'email_verified_at' => now(),
            'phone_verified_at' => now(),
        ]);
    }
}
