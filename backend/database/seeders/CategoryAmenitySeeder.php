<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\PropertyCategory;
use Illuminate\Database\Seeder;

class CategoryAmenitySeeder extends Seeder
{
    public function run(): void
    {
        // ─── Categories ───────────────────────────────────────────────
        $categories = [
            ['name_ar' => 'شقة', 'name_fr' => 'Appartement', 'slug' => 'appartement', 'icon' => 'building-2', 'sort_order' => 1],
            ['name_ar' => 'فيلا', 'name_fr' => 'Villa', 'slug' => 'villa', 'icon' => 'home', 'sort_order' => 2],
            ['name_ar' => 'دار تقليدية', 'name_fr' => 'Dar traditionnel', 'slug' => 'dar', 'icon' => 'tent', 'sort_order' => 3],
            ['name_ar' => 'استوديو', 'name_fr' => 'Studio', 'slug' => 'studio', 'icon' => 'layout-dashboard', 'sort_order' => 4],
            ['name_ar' => 'منزل ريفي', 'name_fr' => 'Maison rurale', 'slug' => 'maison-rurale', 'icon' => 'trees', 'sort_order' => 5],
            ['name_ar' => 'غرفة خاصة', 'name_fr' => 'Chambre privée', 'slug' => 'chambre', 'icon' => 'bed-double', 'sort_order' => 6],
            ['name_ar' => 'شاليه', 'name_fr' => 'Chalet', 'slug' => 'chalet', 'icon' => 'mountain', 'sort_order' => 7],
            ['name_ar' => 'منزل على الشاطئ', 'name_fr' => 'Maison de plage', 'slug' => 'plage', 'icon' => 'waves', 'sort_order' => 8],
        ];

        foreach ($categories as $cat) {
            PropertyCategory::firstOrCreate(['slug' => $cat['slug']], $cat);
        }

        // ─── Amenities ────────────────────────────────────────────────
        $amenities = [
            // General
            ['name_ar' => 'واي فاي', 'name_fr' => 'Wi-Fi', 'icon' => 'wifi', 'category' => 'general'],
            ['name_ar' => 'تكييف هواء', 'name_fr' => 'Climatisation', 'icon' => 'wind', 'category' => 'general'],
            ['name_ar' => 'تلفزيون', 'name_fr' => 'Télévision', 'icon' => 'tv', 'category' => 'general'],
            ['name_ar' => 'مواقف سيارات', 'name_fr' => 'Parking', 'icon' => 'car', 'category' => 'general'],
            ['name_ar' => 'مصعد', 'name_fr' => 'Ascenseur', 'icon' => 'arrow-up-down', 'category' => 'general'],
            // Kitchen
            ['name_ar' => 'مطبخ', 'name_fr' => 'Cuisine', 'icon' => 'utensils', 'category' => 'kitchen'],
            ['name_ar' => 'غسالة', 'name_fr' => 'Lave-linge', 'icon' => 'circle-dot', 'category' => 'kitchen'],
            ['name_ar' => 'ميكرويف', 'name_fr' => 'Micro-ondes', 'icon' => 'box', 'category' => 'kitchen'],
            ['name_ar' => 'ثلاجة', 'name_fr' => 'Réfrigérateur', 'icon' => 'thermometer', 'category' => 'kitchen'],
            ['name_ar' => 'غسالة صحون', 'name_fr' => 'Lave-vaisselle', 'icon' => 'droplets', 'category' => 'kitchen'],
            // Safety
            ['name_ar' => 'كاشف دخان', 'name_fr' => 'Détecteur de fumée', 'icon' => 'flame', 'category' => 'safety'],
            ['name_ar' => 'كاشف أول أكسيد الكربون', 'name_fr' => 'Détecteur CO', 'icon' => 'alert-triangle', 'category' => 'safety'],
            ['name_ar' => 'طفاية حريق', 'name_fr' => 'Extincteur', 'icon' => 'shield', 'category' => 'safety'],
            ['name_ar' => 'كاميرات مراقبة', 'name_fr' => 'Caméras de sécurité', 'icon' => 'camera', 'category' => 'safety'],
            // Outdoor
            ['name_ar' => 'حديقة', 'name_fr' => 'Jardin', 'icon' => 'trees', 'category' => 'outdoor'],
            ['name_ar' => 'تراس', 'name_fr' => 'Terrasse', 'icon' => 'gallery-horizontal', 'category' => 'outdoor'],
            ['name_ar' => 'شرفة', 'name_fr' => 'Balcon', 'icon' => 'layout', 'category' => 'outdoor'],
            ['name_ar' => 'مسبح', 'name_fr' => 'Piscine', 'icon' => 'waves', 'category' => 'outdoor'],
            ['name_ar' => 'شواء/باربيكيو', 'name_fr' => 'Barbecue', 'icon' => 'flame', 'category' => 'outdoor'],
            ['name_ar' => 'إطلالة على البحر', 'name_fr' => 'Vue sur mer', 'icon' => 'eye', 'category' => 'outdoor'],
            // Beach
            ['name_ar' => 'قريب من الشاطئ', 'name_fr' => 'Proche plage', 'icon' => 'umbrella', 'category' => 'outdoor'],
            ['name_ar' => 'أدوات الشاطئ', 'name_fr' => 'Équipements plage', 'icon' => 'sun', 'category' => 'outdoor'],
        ];

        foreach ($amenities as $amenity) {
            Amenity::firstOrCreate(
                ['name_ar' => $amenity['name_ar']],
                $amenity
            );
        }

        $this->command->info('✅ Categories & Amenities seeded');
    }
}
