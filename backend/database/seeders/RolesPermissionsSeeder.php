<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolesPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Properties
            'properties.view', 'properties.create', 'properties.update', 'properties.delete', 'properties.publish',
            // Bookings
            'bookings.view', 'bookings.create', 'bookings.confirm', 'bookings.cancel', 'bookings.manage',
            // Users
            'users.view', 'users.manage', 'users.suspend',
            // Reviews
            'reviews.create', 'reviews.reply', 'reviews.delete',
            // Admin
            'admin.access', 'admin.analytics', 'admin.payments',
        ];

        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm, 'guard_name' => 'web']);
        }

        // ─── Client Role ─────────────────────────────────────────────
        $client = Role::firstOrCreate(['name' => 'client', 'guard_name' => 'web'], [
            'description' => 'Regular renter / guest',
            'color'       => '#10B981',
        ]);
        $client->syncPermissions([
            'properties.view', 'bookings.view', 'bookings.create',
            'bookings.cancel', 'reviews.create',
        ]);

        // ─── Owner Role ───────────────────────────────────────────────
        $owner = Role::firstOrCreate(['name' => 'owner', 'guard_name' => 'web'], [
            'description' => 'Property owner / host',
            'color'       => '#3B82F6',
        ]);
        $owner->syncPermissions([
            'properties.view', 'properties.create', 'properties.update', 'properties.delete',
            'bookings.view', 'bookings.confirm', 'bookings.cancel',
            'reviews.create', 'reviews.reply',
        ]);

        // ─── Admin Role ───────────────────────────────────────────────
        $admin = Role::firstOrCreate(['name' => 'admin', 'guard_name' => 'web'], [
            'description' => 'Platform administrator',
            'color'       => '#EF4444',
        ]);
        $admin->syncPermissions(Permission::all());

        $this->command->info('✅ Roles & Permissions seeded');
    }
}
