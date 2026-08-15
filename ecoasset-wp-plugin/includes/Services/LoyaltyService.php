<?php
// includes/Services/LoyaltyService.php
namespace EcoAsset\Services;

class LoyaltyService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Attribuer des points (achat, avis, parrainage)
     * ✅ Définir les niveaux (Bronze, Silver, Gold, Platinum)
     * ✅ Gérer les récompenses (réductions, goodies, invitations)
     * ✅ Échanger des points contre des avantages
     * ✅ Afficher le statut dans le compte client
     */

    public function award_points( int $user_id, int $points, string $reason ): void {
        global $wpdb;
        
        $wpdb->insert(
            $wpdb->prefix . 'ecoasset_loyalty_history',
            [
                'user_id'    => $user_id,
                'points'     => $points,
                'reason'     => $reason,
                'created_at' => current_time( 'mysql' ),
            ]
        );

        $wpdb->query( $wpdb->prepare(
            "UPDATE {$wpdb->usermeta} 
             SET meta_value = CAST(meta_value AS UNSIGNED) + %d
             WHERE user_id = %d AND meta_key = '_ecoasset_points'",
            $points, $user_id
        ) );

        $this->check_tier_upgrade( $user_id );
    }

    public function get_user_tier( int $user_id ): array {
        $points = (int) get_user_meta( $user_id, '_ecoasset_points', true );
        
        if ( $points >= 10000 ) return [ 'name' => 'Platinum', 'discount' => 20 ];
        if ( $points >= 5000 )  return [ 'name' => 'Gold',     'discount' => 15 ];
        if ( $points >= 2000 )  return [ 'name' => 'Silver',   'discount' => 10 ];
        return [ 'name' => 'Bronze', 'discount' => 5 ];
    }

    private function check_tier_upgrade( int $user_id ): void {
        // Logic to notify if tier is upgraded
    }
}
