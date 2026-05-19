<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Property;
use App\Models\PropertyCategory;
use App\Models\PropertyImage;
use App\Models\User;
use Illuminate\Database\Seeder;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $owner1 = User::where('email', 'owner@chamalcom.ma')->first();
        $owner2 = User::where('email', 'nadia@demo.ma')->first();
        $owner3 = User::where('email', 'hicham@demo.ma')->first();

        $villaCategory = PropertyCategory::where('slug', 'villa')->first();
        $aptCategory   = PropertyCategory::where('slug', 'appartement')->first();
        $studioCategory= PropertyCategory::where('slug', 'studio')->first();

        $amenities = Amenity::all()->pluck('id')->toArray();

        $properties = [
            [
                'owner_id'         => $owner1->id,
                'category_id'      => $villaCategory->id,
                'title_ar'         => 'فيلا لؤلؤة البحر المتوسط - وادي لاو',
                'title_fr'         => 'Villa Perle Méditerranée - Oued Laou',
                'description_ar'   => 'فيلا فاخرة مطلة مباشرة على شاطئ وادي لاو الرملي الذهبي. تتميز بتصميم حديث وأثاث عالي الجودة. تضم 4 غرف نوم واسعة، 3 حمامات، مطبخ مجهز بالكامل، وتراس خاص للاسترخاء مع إطلالة بانورامية على البحر الأبيض المتوسط الساحر.',
                'description_fr'   => 'Villa de luxe avec vue directe sur la plage dorée d\'Oued Laou. Design moderne avec mobilier haut de gamme. 4 chambres spacieuses, 3 salles de bain, cuisine équipée et terrasse panoramique sur la Méditerranée.',
                'price_per_night'  => 1200,
                'price_per_week'   => 7500,
                'price_per_month'  => 22000,
                'cleaning_fee'     => 300,
                'security_deposit' => 2000,
                'address_street'   => 'شارع الشاطئ، وادي لاو',
                'address_city'     => 'وادي لاو',
                'latitude'         => 35.4657,
                'longitude'        => -5.0858,
                'max_guests'       => 8,
                'bedrooms'         => 4,
                'bathrooms'        => 3,
                'beds'             => 5,
                'min_nights'       => 2,
                'instant_booking'  => true,
                'is_featured'      => true,
                'is_verified'      => true,
                'status'           => 'published',
                'rating_average'   => 4.9,
                'rating_count'     => 28,
            ],
            [
                'owner_id'         => $owner1->id,
                'category_id'      => $aptCategory->id,
                'title_ar'         => 'شقة بانوراما - إطلالة 180 درجة على البحر',
                'title_fr'         => 'Appartement Panorama - Vue 180° sur mer',
                'description_ar'   => 'شقة عصرية في الطابق الثالث بإطلالة مذهلة 180 درجة على البحر الأبيض المتوسط وجبال الريف. غرفتان فسيحتان، حمام مزدوج، ومطبخ أمريكي بأحدث التجهيزات. مثالية للأزواج والعائلات الصغيرة.',
                'description_fr'   => 'Appartement moderne au 3ème étage avec vue imprenable à 180° sur la mer et les montagnes du Rif. 2 chambres spacieuses, salle de bain double et cuisine américaine moderne.',
                'price_per_night'  => 650,
                'price_per_week'   => 4000,
                'price_per_month'  => 12000,
                'cleaning_fee'     => 150,
                'security_deposit' => 1000,
                'address_street'   => 'حي المحيط، وادي لاو',
                'address_city'     => 'وادي لاو',
                'latitude'         => 35.4689,
                'longitude'        => -5.0821,
                'max_guests'       => 5,
                'bedrooms'         => 2,
                'bathrooms'        => 2,
                'beds'             => 3,
                'min_nights'       => 1,
                'instant_booking'  => true,
                'is_featured'      => true,
                'is_verified'      => true,
                'status'           => 'published',
                'rating_average'   => 4.7,
                'rating_count'     => 45,
            ],
            [
                'owner_id'         => $owner2->id,
                'category_id'      => $villaCategory->id,
                'title_ar'         => 'فيلا الأطلس - بين الجبال والبحر',
                'title_fr'         => 'Villa Atlas - Entre montagne et mer',
                'description_ar'   => 'فيلا نادرة تجمع بين جمال الجبال وقرب البحر في وادي لاو. مساحة 300 متر مربع، حديقة غنّاء، مسبح خاص، وأثاث مستوحى من الموروث المعماري المغربي الأصيل. تجربة إقامة لا تُنسى.',
                'description_fr'   => 'Villa rare alliant beauté des montagnes et proximité de la mer. 300m², jardin luxuriant, piscine privée et mobilier inspiré du patrimoine marocain. Un séjour inoubliable.',
                'price_per_night'  => 1800,
                'price_per_week'   => 11000,
                'cleaning_fee'     => 500,
                'security_deposit' => 3000,
                'address_street'   => 'طريق الجبال، وادي لاو',
                'address_city'     => 'وادي لاو',
                'latitude'         => 35.4712,
                'longitude'        => -5.0745,
                'max_guests'       => 12,
                'bedrooms'         => 5,
                'bathrooms'        => 4,
                'beds'             => 7,
                'min_nights'       => 3,
                'pets_allowed'     => true,
                'is_featured'      => true,
                'is_verified'      => true,
                'status'           => 'published',
                'rating_average'   => 4.8,
                'rating_count'     => 19,
            ],
            [
                'owner_id'         => $owner3->id,
                'category_id'      => $studioCategory->id,
                'title_ar'         => 'استوديو كوزي - قريب من الشاطئ',
                'title_fr'         => 'Studio Cozy - Proche de la plage',
                'description_ar'   => 'استوديو حديث ومريح على بعد خطوات من الشاطئ. مجهز بالكامل بكل ما تحتاجه لإقامة رائعة. مثالي للزوجين أو المسافر الفرد.',
                'description_fr'   => 'Studio moderne et confortable à quelques pas de la plage. Entièrement équipé. Idéal pour couple ou voyageur solo.',
                'price_per_night'  => 320,
                'cleaning_fee'     => 80,
                'security_deposit' => 500,
                'address_street'   => 'زنقة البحر، وادي لاو',
                'address_city'     => 'وادي لاو',
                'latitude'         => 35.4634,
                'longitude'        => -5.0879,
                'max_guests'       => 2,
                'bedrooms'         => 1,
                'bathrooms'        => 1,
                'beds'             => 1,
                'min_nights'       => 1,
                'instant_booking'  => true,
                'status'           => 'published',
                'rating_average'   => 4.5,
                'rating_count'     => 62,
            ],
        ];

        $placeholderImages = [
            'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800',
            'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        ];

        foreach ($properties as $idx => $propData) {
            $property = Property::firstOrCreate(
                ['title_ar' => $propData['title_ar']],
                $propData
            );

            // Attach random amenities
            $randomAmenities = array_slice($amenities, 0, rand(8, 15));
            $property->amenities()->sync($randomAmenities);

            // Add images
            if ($property->images()->count() === 0) {
                foreach (array_slice($placeholderImages, 0, 3) as $imgIdx => $url) {
                    PropertyImage::create([
                        'property_id' => $property->id,
                        'url'         => $url,
                        'public_id'   => 'placeholder_' . $property->id . '_' . $imgIdx,
                        'is_cover'    => $imgIdx === 0,
                        'sort_order'  => $imgIdx,
                        'alt_ar'      => $property->title_ar,
                        'alt_fr'      => $property->title_fr,
                    ]);
                }
            }
        }

        $this->command->info('✅ Properties seeded');
    }
}
