<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Category;
use App\Models\Agriculteur;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $agriculteurs = Agriculteur::all();

        if ($agriculteurs->isEmpty()) {
            $this->command->warn('No agriculteurs found. Run UserSeeder first.');
            return;
        }

        $products = [
            // Fruits
            [
                'category_slug' => 'fruits',
                'agriculteur_id' => 1,
                'name_ar' => 'برتقال طازج',
                'name_fr' => 'Oranges Fraîches',
                'name_en' => 'Fresh Oranges',
                'description_fr' => 'Oranges fraîchement cueillies, juteuses et sucrées. Parfaites pour le jus ou à consommer telles quelles. Cultivées sans pesticides.',
                'price_per_unit' => 2.50,
                'unit' => 'kg',
                'stock_available' => 500,
                'minimum_order' => 2,
                'harvest_date' => now()->subDays(3),
                'is_organic' => true,
                'certifications' => ['bio'],
                'tags' => ['fresh', 'local', 'seasonal'],
                'rating_average' => 4.8,
                'rating_count' => 24,
                'sales_count' => 156,
                'views_count' => 423,
            ],
            [
                'category_slug' => 'fruits',
                'agriculteur_id' => 1,
                'name_ar' => 'ليمون',
                'name_fr' => 'Citrons',
                'name_en' => 'Lemons',
                'description_fr' => 'Citrons juteux de Nabeul, idéaux pour vos recettes et boissons. Riches en vitamine C.',
                'price_per_unit' => 3.00,
                'unit' => 'kg',
                'stock_available' => 300,
                'minimum_order' => 1,
                'harvest_date' => now()->subDays(2),
                'is_organic' => true,
                'certifications' => ['bio', 'aoc'],
                'tags' => ['fresh', 'local'],
                'rating_average' => 4.9,
                'rating_count' => 18,
                'sales_count' => 89,
                'views_count' => 267,
            ],
            [
                'category_slug' => 'fruits-rouges',
                'agriculteur_id' => 1,
                'name_ar' => 'فراولة',
                'name_fr' => 'Fraises',
                'name_en' => 'Strawberries',
                'description_fr' => 'Fraises sucrées et parfumées, cueillies à maturité. Excellentes en dessert ou en confiture.',
                'price_per_unit' => 8.00,
                'unit' => 'kg',
                'stock_available' => 80,
                'minimum_order' => 0.5,
                'harvest_date' => now()->subDay(),
                'is_organic' => true,
                'certifications' => ['bio'],
                'tags' => ['fresh', 'premium', 'seasonal'],
                'rating_average' => 5.0,
                'rating_count' => 31,
                'sales_count' => 92,
                'views_count' => 512,
            ],
            // Légumes
            [
                'category_slug' => 'tomates',
                'agriculteur_id' => 1,
                'name_ar' => 'طماطم',
                'name_fr' => 'Tomates Bio',
                'name_en' => 'Organic Tomatoes',
                'description_fr' => 'Tomates biologiques cultivées naturellement, goûteuses et charnues. Parfaites pour les salades et sauces.',
                'price_per_unit' => 2.80,
                'unit' => 'kg',
                'stock_available' => 400,
                'minimum_order' => 2,
                'harvest_date' => now()->subDays(1),
                'is_organic' => true,
                'certifications' => ['bio'],
                'tags' => ['fresh', 'local', 'best-seller'],
                'rating_average' => 4.7,
                'rating_count' => 42,
                'sales_count' => 234,
                'views_count' => 678,
            ],
            [
                'category_slug' => 'pommes-de-terre',
                'agriculteur_id' => 1,
                'name_ar' => 'بطاطا',
                'name_fr' => 'Pommes de terre',
                'name_en' => 'Potatoes',
                'description_fr' => 'Pommes de terre de qualité, idéales pour toutes vos préparations culinaires.',
                'price_per_unit' => 1.50,
                'unit' => 'kg',
                'stock_available' => 800,
                'minimum_order' => 5,
                'harvest_date' => now()->subDays(10),
                'is_organic' => false,
                'tags' => ['local', 'versatile'],
                'rating_average' => 4.5,
                'rating_count' => 28,
                'sales_count' => 312,
                'views_count' => 445,
            ],
            // Huile d'olive
            [
                'category_slug' => 'huile-olive',
                'agriculteur_id' => 2,
                'name_ar' => 'زيت زيتون بكر ممتاز',
                'name_fr' => 'Huile d\'Olive Extra Vierge',
                'name_en' => 'Extra Virgin Olive Oil',
                'description_fr' => 'Huile d\'olive extra vierge de première pression à froid. Saveur fruitée et notes d\'herbes fraîches. Acidité < 0.8%.',
                'price_per_unit' => 45.00,
                'unit' => 'l',
                'stock_available' => 200,
                'minimum_order' => 1,
                'harvest_date' => now()->subMonths(2),
                'is_organic' => true,
                'certifications' => ['bio', 'aoc', 'halal'],
                'tags' => ['premium', 'best-seller', 'award-winning'],
                'rating_average' => 5.0,
                'rating_count' => 67,
                'sales_count' => 189,
                'views_count' => 892,
            ],
            [
                'category_slug' => 'huile-olive',
                'agriculteur_id' => 2,
                'name_ar' => 'زيت زيتون بكر',
                'name_fr' => 'Huile d\'Olive Vierge',
                'name_en' => 'Virgin Olive Oil',
                'description_fr' => 'Huile d\'olive vierge de qualité supérieure, idéale pour la cuisine quotidienne.',
                'price_per_unit' => 35.00,
                'unit' => 'l',
                'stock_available' => 300,
                'minimum_order' => 1,
                'harvest_date' => now()->subMonths(2),
                'is_organic' => true,
                'certifications' => ['bio', 'halal'],
                'tags' => ['quality', 'local'],
                'rating_average' => 4.8,
                'rating_count' => 45,
                'sales_count' => 156,
                'views_count' => 567,
            ],
            // Dattes
            [
                'category_slug' => 'dattes',
                'agriculteur_id' => 3,
                'name_ar' => 'تمر دقلة نور',
                'name_fr' => 'Dattes Deglet Nour',
                'name_en' => 'Deglet Nour Dates',
                'description_fr' => 'Dattes Deglet Nour de Tozeur, les meilleures de Tunisie. Sucrées, translucides et fondantes. Conditionnées en branches.',
                'price_per_unit' => 15.00,
                'unit' => 'kg',
                'stock_available' => 500,
                'minimum_order' => 1,
                'harvest_date' => now()->subMonths(1),
                'is_organic' => false,
                'certifications' => ['aoc'],
                'tags' => ['premium', 'best-seller', 'traditional'],
                'rating_average' => 4.9,
                'rating_count' => 38,
                'sales_count' => 267,
                'views_count' => 834,
            ],
            [
                'category_slug' => 'dattes',
                'agriculteur_id' => 3,
                'name_ar' => 'تمر عالي',
                'name_fr' => 'Dattes Allig',
                'name_en' => 'Allig Dates',
                'description_fr' => 'Dattes Allig charnues et moelleuses, parfaites pour les pâtisseries traditionnelles.',
                'price_per_unit' => 12.00,
                'unit' => 'kg',
                'stock_available' => 300,
                'minimum_order' => 1,
                'harvest_date' => now()->subMonths(1),
                'is_organic' => false,
                'tags' => ['traditional', 'local'],
                'rating_average' => 4.6,
                'rating_count' => 22,
                'sales_count' => 123,
                'views_count' => 456,
            ],
            // Miel
            [
                'category_slug' => 'miel',
                'agriculteur_id' => 4,
                'name_ar' => 'عسل طبيعي',
                'name_fr' => 'Miel de Fleurs Sauvages',
                'name_en' => 'Wildflower Honey',
                'description_fr' => 'Miel 100% naturel récolté dans les montagnes de Bizerte. Riche en antioxydants et au goût floral délicat.',
                'price_per_unit' => 25.00,
                'unit' => 'kg',
                'stock_available' => 100,
                'minimum_order' => 0.5,
                'harvest_date' => now()->subMonths(1),
                'is_organic' => true,
                'certifications' => ['bio'],
                'tags' => ['premium', 'natural', 'health'],
                'rating_average' => 4.9,
                'rating_count' => 52,
                'sales_count' => 145,
                'views_count' => 678,
            ],
            [
                'category_slug' => 'miel',
                'agriculteur_id' => 4,
                'name_ar' => 'عسل إكليل الجبل',
                'name_fr' => 'Miel de Romarin',
                'name_en' => 'Rosemary Honey',
                'description_fr' => 'Miel de romarin aux propriétés digestives. Saveur douce et parfumée.',
                'price_per_unit' => 28.00,
                'unit' => 'kg',
                'stock_available' => 80,
                'minimum_order' => 0.5,
                'harvest_date' => now()->subMonths(1),
                'is_organic' => true,
                'certifications' => ['bio'],
                'tags' => ['premium', 'health', 'digestive'],
                'rating_average' => 5.0,
                'rating_count' => 34,
                'sales_count' => 98,
                'views_count' => 489,
            ],
            // Produits laitiers
            [
                'category_slug' => 'produits-laitiers',
                'agriculteur_id' => 5,
                'name_ar' => 'حليب طازج',
                'name_fr' => 'Lait Frais de Ferme',
                'name_en' => 'Fresh Farm Milk',
                'description_fr' => 'Lait frais de vache, non traité, directement de la ferme. Riche et crémeux.',
                'price_per_unit' => 2.00,
                'unit' => 'l',
                'stock_available' => 150,
                'minimum_order' => 2,
                'harvest_date' => now(),
                'is_organic' => false,
                'certifications' => ['halal'],
                'tags' => ['fresh', 'daily', 'local'],
                'rating_average' => 4.7,
                'rating_count' => 31,
                'sales_count' => 178,
                'views_count' => 423,
            ],
            [
                'category_slug' => 'produits-laitiers',
                'agriculteur_id' => 5,
                'name_ar' => 'جبن طري',
                'name_fr' => 'Fromage Frais Artisanal',
                'name_en' => 'Artisanal Fresh Cheese',
                'description_fr' => 'Fromage frais fait maison, saveur douce et texture crémeuse. Idéal pour le petit-déjeuner.',
                'price_per_unit' => 12.00,
                'unit' => 'kg',
                'stock_available' => 50,
                'minimum_order' => 0.5,
                'harvest_date' => now(),
                'is_organic' => false,
                'certifications' => ['halal'],
                'tags' => ['fresh', 'artisanal', 'traditional'],
                'rating_average' => 4.8,
                'rating_count' => 26,
                'sales_count' => 87,
                'views_count' => 312,
            ],
        ];

        foreach ($products as $productData) {
            $categorySlug = $productData['category_slug'];
            unset($productData['category_slug']);

            $category = Category::where('slug', $categorySlug)->first();

            if (!$category) {
                $this->command->warn("Category '{$categorySlug}' not found. Skipping product.");
                continue;
            }

            $agriculteurId = $productData['agriculteur_id'];
            $agriculteur = $agriculteurs->where('id', $agriculteurId)->first();

            if (!$agriculteur) {
                $this->command->warn("Agriculteur ID {$agriculteurId} not found. Skipping product.");
                continue;
            }

            Product::create([
                ...$productData,
                'agriculteur_id' => $agriculteur->id,
                'category_id' => $category->id,
                'origin' => $agriculteur->governorate,
                'images' => [
                    'https://via.placeholder.com/800x600?text=' . urlencode($productData['name_fr']),
                ],
                'status' => 'active',
            ]);
        }

        $this->command->info('Products seeded successfully!');
    }
}
