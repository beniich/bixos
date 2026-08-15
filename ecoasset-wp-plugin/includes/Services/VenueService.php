<?php
// includes/Services/VenueService.php
namespace EcoAsset\Services;

class VenueService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Enregistrer les lieux (salles, stades, théâtres)
     * ✅ Stocker les informations pratiques (adresse, transports)
     * ✅ Gérer les plans de salle et sièges
     * ✅ Calculer la capacité réelle
     * ✅ Fournir les coordonnées GPS pour les cartes
     */

    public function register( array $data ): int|\WP_Error {
        return wp_insert_post([
            'post_type'   => 'ecoasset_venue',
            'post_title'  => sanitize_text_field( $data['name'] ),
            'post_content'=> wp_kses_post( $data['description'] ?? '' ),
            'post_status' => 'publish',
        ]);
    }

    public function get_layout( int $venue_id ): ?array {
        $layout = get_post_meta( $venue_id, '_venue_layout_json', true );
        return $layout ? json_decode( $layout, true ) : null;
    }

    public function get_coordinates( int $venue_id ): ?array {
        $lat = get_post_meta( $venue_id, '_venue_lat', true );
        $lng = get_post_meta( $venue_id, '_venue_lng', true );
        return ( $lat && $lng ) ? [ 'lat' => $lat, 'lng' => $lng ] : null;
    }
}
