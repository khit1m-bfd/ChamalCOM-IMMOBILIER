<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $this->createUser([
            'first_name'        => 'Admin',
            'last_name'         => 'ChamalCom',
            'email'             => 'admin@chamalcom.ma',
            'password'          => 'Admin@123456',
            'role'              => 'admin',
            'locale'            => 'fr',
            'profile'           => [
                'bio'          => 'Administrateur de la plateforme ChamalCom',
                'address_city' => 'Oued Laou',
            ],
        ]);

        $this->createUser([
            'first_name'        => 'يوسف',
            'last_name'         => 'البكوري',
            'email'             => 'owner@chamalcom.ma',
            'phone'             => '+212661234567',
            'password'          => 'Owner@123456',
            'role'              => 'owner',
            'locale'            => 'ar',
            'profile'           => [
                'bio'              => 'مضيف بوادي لاو — فيلات وشقق مطلة على البحر المتوسط.',
                'address_city'     => 'وادي لاو',
                'is_verified_host' => true,
                'host_since'       => now()->subYear(),
                'rating_average'   => 4.8,
                'rating_count'     => 47,
                'languages_spoken' => ['ar', 'fr'],
            ],
        ]);

        $this->createUser([
            'first_name'        => 'أيمن',
            'last_name'         => 'الزياني',
            'email'             => 'client@chamalcom.ma',
            'phone'             => '+212612345678',
            'password'          => 'Client@123456',
            'role'              => 'client',
            'locale'            => 'ar',
            'profile'           => [
                'bio'          => 'أحب السفر واستكشاف جمال المغرب.',
                'address_city' => 'الرباط',
            ],
        ]);

        // Extra owners
        $this->createUser([
            'first_name' => 'نادية', 'last_name' => 'العمراني',
            'email' => 'nadia@demo.ma', 'password' => 'Demo@123456',
            'role' => 'owner', 'locale' => 'ar',
            'profile' => ['address_city' => 'وادي لاو', 'is_verified_host' => true],
        ]);
        $this->createUser([
            'first_name' => 'هشام', 'last_name' => 'بلحوت',
            'email' => 'hicham@demo.ma', 'password' => 'Demo@123456',
            'role' => 'owner', 'locale' => 'ar',
            'profile' => ['address_city' => 'وادي لاو'],
        ]);

        // Extra clients
        $this->createUser([
            'first_name' => 'فاطمة', 'last_name' => 'الحسني',
            'email' => 'fatima@demo.ma', 'password' => 'Demo@123456',
            'role' => 'client', 'locale' => 'ar',
            'profile' => ['address_city' => 'الدار البيضاء'],
        ]);
        $this->createUser([
            'first_name' => 'كريم', 'last_name' => 'الشرقي',
            'email' => 'karim@demo.ma', 'password' => 'Demo@123456',
            'role' => 'client', 'locale' => 'fr',
            'profile' => ['address_city' => 'Casablanca'],
        ]);
        $this->createUser([
            'first_name' => 'سارة', 'last_name' => 'المنصوري',
            'email' => 'sara@demo.ma', 'password' => 'Demo@123456',
            'role' => 'client', 'locale' => 'ar',
            'profile' => ['address_city' => 'مراكش'],
        ]);

        $this->command->info('');
        $this->command->info('╔══════════════════════════════════════════════════════╗');
        $this->command->info('║           COMPTES DE CONNEXION / بيانات الدخول        ║');
        $this->command->info('╠══════════════════════════════════════════════════════╣');
        $this->command->info('║  ADMIN  →  admin@chamalcom.ma  /  Admin@123456       ║');
        $this->command->info('║  OWNER  →  owner@chamalcom.ma  /  Owner@123456       ║');
        $this->command->info('║  CLIENT →  client@chamalcom.ma /  Client@123456      ║');
        $this->command->info('╚══════════════════════════════════════════════════════╝');
        $this->command->info('');
    }

    private function createUser(array $data): User
    {
        $user = User::firstOrCreate(['email' => $data['email']], [
            'first_name'        => $data['first_name'],
            'last_name'         => $data['last_name'],
            'phone'             => $data['phone'] ?? null,
            'password'          => Hash::make($data['password']),
            'status'            => 'active',
            'email_verified'    => true,
            'email_verified_at' => now(),
            'locale'            => $data['locale'] ?? 'ar',
        ]);

        $role = Role::where('name', $data['role'])->where('guard_name', 'web')->first();
        if ($role && !$user->hasRole($data['role'])) {
            $user->assignRole($role);
        }

        UserProfile::firstOrCreate(['user_id' => $user->id], $data['profile'] ?? []);

        return $user;
    }
}
