<?php
// includes/Services/ReviewService.php
namespace EcoAsset\Services;

class ReviewService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Collecter les avis (seulement après participation)
     * ✅ Calculer la moyenne par événement
     * ✅ Modérer les avis
     * ✅ Répondre aux avis
     * ✅ Détecter les faux avis
     */

    public function submit( int $event_id, int $user_id, array $data ): int|\WP_Error {
        // Vérifier que l'utilisateur a assisté
        if ( ! $this->user_attended( $user_id, $event_id ) ) {
            return new \WP_Error( 'not_attended', 'Vous devez avoir assisté pour laisser un avis' );
        }

        $review_id = wp_insert_post([
            'post_type'    => 'ecoasset_review',
            'post_title'   => sanitize_text_field( $data['title'] ),
            'post_content' => sanitize_textarea_field( $data['content'] ),
            'post_author'  => $user_id,
            'post_status'  => 'pending', // Modération
        ]);

        update_post_meta( $review_id, '_review_event_id', $event_id );
        update_post_meta( $review_id, '_review_rating', intval( $data['rating'] ) );

        return $review_id;
    }

    public function get_average( int $event_id ): float {
        global $wpdb;
        return (float) $wpdb->get_var( $wpdb->prepare(
            "SELECT AVG(CAST(meta_value AS UNSIGNED)) 
             FROM {$wpdb->postmeta} pm
             INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
             WHERE pm.meta_key = '_review_rating'
             AND p.post_status = 'publish'
             AND pm.post_id IN (
                 SELECT post_id FROM {$wpdb->postmeta} 
                 WHERE meta_key = '_review_event_id' AND meta_value = %d
             )",
            $event_id
        ) );
    }

    private function user_attended( int $user_id, int $event_id ): bool {
        // Dépendance à BookingService théoriquement
        $booking_service = new BookingService();
        return $booking_service->user_attended_event( $user_id, $event_id );
    }
}
