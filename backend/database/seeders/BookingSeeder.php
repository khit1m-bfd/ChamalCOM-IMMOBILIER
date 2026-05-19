<?php

namespace Database\Seeders;

use App\Models\Booking;
use App\Models\Payment;
use App\Models\Property;
use App\Models\Review;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class BookingSeeder extends Seeder
{
    public function run(): void
    {
        if (Booking::count() > 0) {
            $this->command->info('✅ Bookings already seeded — skipping');
            return;
        }

        // ─── Users ────────────────────────────────────────────────────
        $client  = User::where('email', 'client@chamalcom.ma')->first();
        $client2 = User::where('email', 'karim@demo.ma')->first();
        $client3 = User::where('email', 'fatima@demo.ma')->first();
        $client4 = User::where('email', 'sara@demo.ma')->first();

        // ─── Properties ───────────────────────────────────────────────
        $properties = Property::where('status', 'published')->get();
        if ($properties->isEmpty() || !$client) {
            $this->command->warn('⚠️  No published properties or client user found — skipping bookings');
            return;
        }

        $villa    = $properties->first();                         // owner@chamalcom.ma
        $appt     = $properties->skip(1)->first() ?? $villa;
        $villaAtl = $properties->skip(2)->first() ?? $villa;
        $studio   = $properties->skip(3)->first() ?? $villa;

        // ═══════════════════════════════════════════════════════════════
        //  HISTORIQUE (passé) — pour le dashboard & les stats des gains
        // ═══════════════════════════════════════════════════════════════

        // 1. Terminée il y a 5 mois — avec avis 5★
        $b1 = $this->makeBooking($villa, $client, [
            'check_in_date'  => now()->subMonths(5)->setDay(3),
            'check_out_date' => now()->subMonths(5)->setDay(3)->addDays(7),
            'nights_count'   => 7,
            'adults_count'   => 4,
            'children_count' => 2,
            'guest_message'  => 'Famille de 6, première visite à Oued Laou — très impatients !',
            'status'         => 'completed',
            'payment_status' => 'paid',
            'guest_reviewed' => true,
            'confirmed_at'   => now()->subMonths(5)->setDay(1),
            'completed_at'   => now()->subMonths(5)->setDay(3)->addDays(7),
        ]);
        $this->makePayment($b1, 'succeeded');
        $this->makeReview($b1, $client, [
            'rating_overall'       => 5,
            'rating_cleanliness'   => 5,
            'rating_accuracy'      => 5,
            'rating_communication' => 5,
            'rating_location'      => 5,
            'rating_value'         => 4,
            'comment_ar'           => 'إقامة لا تُنسى! المكان أجمل من الصور، نظيف تماماً والإطلالة على البحر رائعة. يوسف مضيف ممتاز ومتعاون جداً. سنعود بإذن الله.',
            'comment_fr'           => 'Séjour inoubliable ! Le lieu est encore plus beau qu\'en photos, très propre, vue sur mer magnifique. Youssef est un hôte exceptionnel. Nous reviendrons !',
        ]);

        // 2. Terminée il y a 4 mois — karim — avis 4★
        $b2 = $this->makeBooking($villa, $client2, [
            'check_in_date'  => now()->subMonths(4)->setDay(12),
            'check_out_date' => now()->subMonths(4)->setDay(12)->addDays(4),
            'nights_count'   => 4,
            'adults_count'   => 2,
            'status'         => 'completed',
            'payment_status' => 'paid',
            'guest_reviewed' => true,
            'confirmed_at'   => now()->subMonths(4)->setDay(10),
            'completed_at'   => now()->subMonths(4)->setDay(12)->addDays(4),
        ]);
        $this->makePayment($b2, 'succeeded');
        $this->makeReview($b2, $client2, [
            'rating_overall'       => 4,
            'rating_cleanliness'   => 4,
            'rating_accuracy'      => 5,
            'rating_communication' => 4,
            'rating_location'      => 5,
            'rating_value'         => 4,
            'comment_ar'           => 'مكان جميل جداً وهادئ. الإطلالة على البحر رائعة. سأعود مرة أخرى.',
            'comment_fr'           => 'Très bel endroit, calme avec vue mer magnifique. Je reviendrai.',
        ]);

        // 3. Terminée il y a 3 mois — fatima — sans avis (délai expiré)
        $b3 = $this->makeBooking($appt, $client3, [
            'check_in_date'  => now()->subMonths(3)->setDay(5),
            'check_out_date' => now()->subMonths(3)->setDay(5)->addDays(5),
            'nights_count'   => 5,
            'adults_count'   => 3,
            'children_count' => 1,
            'status'         => 'completed',
            'payment_status' => 'paid',
            'guest_reviewed' => false,
            'confirmed_at'   => now()->subMonths(3)->setDay(3),
            'completed_at'   => now()->subMonths(3)->setDay(5)->addDays(5),
        ]);
        $this->makePayment($b3, 'succeeded');

        // 4. Terminée il y a 2 mois — sara — avis 5★
        $b4 = $this->makeBooking($villa, $client4, [
            'check_in_date'  => now()->subMonths(2)->setDay(8),
            'check_out_date' => now()->subMonths(2)->setDay(8)->addDays(6),
            'nights_count'   => 6,
            'adults_count'   => 2,
            'children_count' => 1,
            'status'         => 'completed',
            'payment_status' => 'paid',
            'guest_reviewed' => true,
            'confirmed_at'   => now()->subMonths(2)->setDay(6),
            'completed_at'   => now()->subMonths(2)->setDay(8)->addDays(6),
        ]);
        $this->makePayment($b4, 'succeeded');
        $this->makeReview($b4, $client4, [
            'rating_overall'       => 5,
            'rating_cleanliness'   => 5,
            'rating_accuracy'      => 5,
            'rating_communication' => 5,
            'rating_location'      => 5,
            'rating_value'         => 5,
            'comment_ar'           => 'أفضل إقامة في حياتي! كل شيء مثالي. شكراً يوسف.',
            'comment_fr'           => 'Le meilleur séjour de ma vie ! Tout était parfait. Merci Youssef.',
        ]);

        // 5. Terminée il y a 1 mois — client — avis en attente (peut encore noter)
        $b5 = $this->makeBooking($appt, $client, [
            'check_in_date'  => now()->subMonths(1)->setDay(14),
            'check_out_date' => now()->subMonths(1)->setDay(14)->addDays(3),
            'nights_count'   => 3,
            'adults_count'   => 2,
            'status'         => 'completed',
            'payment_status' => 'paid',
            'guest_reviewed' => false,
            'confirmed_at'   => now()->subMonths(1)->setDay(12),
            'completed_at'   => now()->subMonths(1)->setDay(14)->addDays(3),
        ]);
        $this->makePayment($b5, 'succeeded');

        // 6. Terminée il y a 6 mois (Studio) — pour remplir le graphique 6 mois
        $b6 = $this->makeBooking($studio, $client2, [
            'check_in_date'  => now()->subMonths(6)->setDay(20),
            'check_out_date' => now()->subMonths(6)->setDay(20)->addDays(2),
            'nights_count'   => 2,
            'adults_count'   => 2,
            'status'         => 'completed',
            'payment_status' => 'paid',
            'guest_reviewed' => true,
            'confirmed_at'   => now()->subMonths(6)->setDay(18),
            'completed_at'   => now()->subMonths(6)->setDay(20)->addDays(2),
        ]);
        $this->makePayment($b6, 'succeeded');
        $this->makeReview($b6, $client2, [
            'rating_overall'     => 5,
            'rating_cleanliness' => 5,
            'rating_accuracy'    => 4,
            'comment_ar'         => 'استوديو رائع وموقع ممتاز!',
            'comment_fr'         => 'Studio top et emplacement idéal !',
        ]);

        // ═══════════════════════════════════════════════════════════════
        //  EN COURS — séjour actif maintenant
        // ═══════════════════════════════════════════════════════════════

        // 7. Séjour en cours (check-in hier, check-out dans 3 jours)
        $b7 = $this->makeBooking($villa, $client3, [
            'check_in_date'  => now()->subDay(),
            'check_out_date' => now()->addDays(3),
            'nights_count'   => 4,
            'adults_count'   => 4,
            'children_count' => 2,
            'guest_message'  => 'Nous serons 4 adultes et 2 enfants. Y a-t-il un lit bébé disponible ?',
            'status'         => 'confirmed',
            'payment_status' => 'paid',
            'confirmed_at'   => now()->subDays(5),
        ]);
        $this->makePayment($b7, 'succeeded');

        // ═══════════════════════════════════════════════════════════════
        //  À VENIR — confirmées
        // ═══════════════════════════════════════════════════════════════

        // 8. Confirmée dans 10 jours
        $b8 = $this->makeBooking($villa, $client2, [
            'check_in_date'  => now()->addDays(10),
            'check_out_date' => now()->addDays(17),
            'nights_count'   => 7,
            'adults_count'   => 4,
            'guest_message'  => 'Voyage en famille pour les vacances scolaires.',
            'status'         => 'confirmed',
            'payment_status' => 'paid',
            'confirmed_at'   => now()->subDays(2),
        ]);
        $this->makePayment($b8, 'succeeded');

        // 9. Confirmée dans 25 jours (Studio)
        $b9 = $this->makeBooking($studio, $client4, [
            'check_in_date'  => now()->addDays(25),
            'check_out_date' => now()->addDays(27),
            'nights_count'   => 2,
            'adults_count'   => 2,
            'status'         => 'confirmed',
            'payment_status' => 'paid',
            'confirmed_at'   => now()->subDay(),
        ]);
        $this->makePayment($b9, 'succeeded');

        // ═══════════════════════════════════════════════════════════════
        //  EN ATTENTE — demandes à confirmer par l'hôte
        // ═══════════════════════════════════════════════════════════════

        // 10. En attente — demande de réservation (non instant booking)
        $b10 = $this->makeBooking($villaAtl, $client, [
            'check_in_date'  => now()->addDays(20),
            'check_out_date' => now()->addDays(24),
            'nights_count'   => 4,
            'adults_count'   => 3,
            'children_count' => 1,
            'guest_message'  => 'Bonjour ! Nous sommes une famille de 4 personnes. Le logement est-il disponible ?',
            'status'         => 'pending',
            'payment_status' => 'pending',
        ]);

        // 11. En attente — autre client
        $b11 = $this->makeBooking($villa, $client3, [
            'check_in_date'  => now()->addDays(32),
            'check_out_date' => now()->addDays(37),
            'nights_count'   => 5,
            'adults_count'   => 2,
            'guest_message'  => 'لنا أول زيارة لوادي لاو، هل يمكنكم الترحيب بنا؟',
            'status'         => 'pending',
            'payment_status' => 'pending',
        ]);

        // ═══════════════════════════════════════════════════════════════
        //  ANNULÉES
        // ═══════════════════════════════════════════════════════════════

        // 12. Annulée par le client (remboursée)
        $b12 = $this->makeBooking($villa, $client, [
            'check_in_date'       => now()->subMonths(1)->setDay(2),
            'check_out_date'      => now()->subMonths(1)->setDay(2)->addDays(5),
            'nights_count'        => 5,
            'adults_count'        => 2,
            'status'              => 'cancelled_by_guest',
            'payment_status'      => 'refunded',
            'cancelled_at'        => now()->subMonths(1)->setDay(1),
            'cancellation_reason' => 'Changement de planning de dernière minute.',
            'refund_amount'       => $villa->price_per_night * 5 * 0.8,
            'confirmed_at'        => now()->subMonths(1)->subDays(5),
        ]);
        $this->makePayment($b12, 'refunded');

        // 13. Annulée par l'hôte
        $b13 = $this->makeBooking($appt, $client4, [
            'check_in_date'       => now()->subWeeks(3),
            'check_out_date'      => now()->subWeeks(3)->addDays(3),
            'nights_count'        => 3,
            'adults_count'        => 2,
            'status'              => 'cancelled_by_owner',
            'payment_status'      => 'refunded',
            'cancelled_at'        => now()->subWeeks(3)->subDays(2),
            'cancellation_reason' => 'Travaux imprévus dans l\'appartement.',
            'refund_amount'       => $appt->price_per_night * 3,
            'confirmed_at'        => now()->subWeeks(3)->subDays(5),
        ]);
        $this->makePayment($b13, 'refunded');

        $this->command->info('✅ Bookings seeded (13 bookings: 6 completed, 1 active, 2 upcoming, 2 pending, 2 cancelled)');
    }

    // ─── Helpers ──────────────────────────────────────────────────────

    private function makeBooking(Property $property, User $guest, array $overrides): Booking
    {
        $nights  = $overrides['nights_count'] ?? 3;
        $base    = round($property->price_per_night * $nights, 2);
        $service = round($base * 0.10, 2);
        $total   = $base + ($property->cleaning_fee ?? 0) + $service;

        return Booking::create(array_merge([
            'property_id'      => $property->id,
            'guest_id'         => $guest->id,
            'owner_id'         => $property->owner_id,
            'adults_count'     => 2,
            'children_count'   => 0,
            'base_price'       => $base,
            'cleaning_fee'     => $property->cleaning_fee ?? 0,
            'security_deposit' => $property->security_deposit ?? 0,
            'service_fee'      => $service,
            'discount_amount'  => 0,
            'total_amount'     => $total,
            'currency'         => 'MAD',
            'status'           => 'pending',
            'payment_status'   => 'pending',
            'source'           => 'web',
            'snapshot'         => [
                'title_ar'       => $property->title_ar,
                'title_fr'       => $property->title_fr,
                'price_per_night'=> $property->price_per_night,
                'address_city'   => $property->address_city,
            ],
        ], $overrides));
    }

    private function makePayment(Booking $booking, string $status): void
    {
        $isPaid     = in_array($status, ['succeeded', 'refunded']);
        $isRefunded = $status === 'refunded';

        Payment::create([
            'id'                     => Str::uuid(),
            'booking_id'             => $booking->id,
            'user_id'                => $booking->guest_id,
            'stripe_payment_intent_id' => 'pi_demo_' . strtoupper(Str::random(12)),
            'amount'                 => $booking->total_amount,
            'currency'               => 'MAD',
            'type'                   => 'booking',
            'status'                 => $status,
            'payment_method'         => 'card',
            'payment_details'        => ['brand' => 'visa', 'last4' => '4242'],
            'paid_at'                => $isPaid ? now() : null,
        ]);

        if ($isRefunded && $booking->refund_amount > 0) {
            Payment::create([
                'id'             => Str::uuid(),
                'booking_id'     => $booking->id,
                'user_id'        => $booking->guest_id,
                'amount'         => $booking->refund_amount,
                'currency'       => 'MAD',
                'type'           => 'refund',
                'status'         => 'succeeded',
                'payment_method' => 'card',
                'paid_at'        => $booking->cancelled_at ?? now(),
            ]);
        }
    }

    private function makeReview(Booking $booking, User $reviewer, array $data): void
    {
        Review::create(array_merge([
            'booking_id'           => $booking->id,
            'property_id'          => $booking->property_id,
            'reviewer_id'          => $reviewer->id,
            'reviewee_id'          => $booking->owner_id,
            'type'                 => 'guest_to_property',
            'rating_overall'       => 5,
            'rating_cleanliness'   => 5,
            'rating_accuracy'      => 5,
            'rating_communication' => 5,
            'rating_location'      => 5,
            'rating_value'         => 5,
            'comment_ar'           => '',
            'comment_fr'           => '',
            'is_public'            => true,
            'is_approved'          => true,
        ], $data));
    }
}
