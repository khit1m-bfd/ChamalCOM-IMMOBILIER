<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesPermissionsSeeder::class,
            CategoryAmenitySeeder::class,
            UserSeeder::class,
            PropertySeeder::class,
            BookingSeeder::class,
        ]);
    }
}
