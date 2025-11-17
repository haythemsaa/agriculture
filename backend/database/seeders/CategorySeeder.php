<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            [
                'name_ar' => 'فواكه',
                'name_fr' => 'Fruits',
                'name_en' => 'Fruits',
                'slug' => 'fruits',
                'icon' => '🍎',
                'is_active' => true,
                'children' => [
                    ['name_ar' => 'حمضيات', 'name_fr' => 'Agrumes', 'name_en' => 'Citrus', 'slug' => 'agrumes'],
                    ['name_ar' => 'فواكه حمراء', 'name_fr' => 'Fruits Rouges', 'name_en' => 'Berries', 'slug' => 'fruits-rouges'],
                ]
            ],
            [
                'name_ar' => 'خضروات',
                'name_fr' => 'Légumes',
                'name_en' => 'Vegetables',
                'slug' => 'legumes',
                'icon' => '🥬',
                'is_active' => true,
                'children' => [
                    ['name_ar' => 'طماطم', 'name_fr' => 'Tomates', 'name_en' => 'Tomatoes', 'slug' => 'tomates'],
                    ['name_ar' => 'بطاطا', 'name_fr' => 'Pommes de terre', 'name_en' => 'Potatoes', 'slug' => 'pommes-de-terre'],
                ]
            ],
            [
                'name_ar' => 'حبوب',
                'name_fr' => 'Céréales',
                'name_en' => 'Cereals',
                'slug' => 'cereales',
                'icon' => '🌾',
                'is_active' => true,
            ],
            [
                'name_ar' => 'زيت زيتون',
                'name_fr' => 'Huile d\'Olive',
                'name_en' => 'Olive Oil',
                'slug' => 'huile-olive',
                'icon' => '🫒',
                'is_active' => true,
            ],
            [
                'name_ar' => 'تمور',
                'name_fr' => 'Dattes',
                'name_en' => 'Dates',
                'slug' => 'dattes',
                'icon' => '🌴',
                'is_active' => true,
            ],
            [
                'name_ar' => 'منتجات الألبان',
                'name_fr' => 'Produits Laitiers',
                'name_en' => 'Dairy Products',
                'slug' => 'produits-laitiers',
                'icon' => '🥛',
                'is_active' => true,
            ],
            [
                'name_ar' => 'عسل',
                'name_fr' => 'Miel',
                'name_en' => 'Honey',
                'slug' => 'miel',
                'icon' => '🍯',
                'is_active' => true,
            ],
        ];

        foreach ($categories as $index => $categoryData) {
            $children = $categoryData['children'] ?? [];
            unset($categoryData['children']);

            $category = Category::create([
                ...$categoryData,
                'sort_order' => $index + 1,
            ]);

            foreach ($children as $childIndex => $childData) {
                Category::create([
                    'parent_id' => $category->id,
                    ...$childData,
                    'is_active' => true,
                    'sort_order' => $childIndex + 1,
                ]);
            }
        }
    }
}
