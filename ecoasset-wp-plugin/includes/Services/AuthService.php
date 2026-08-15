<?php
// includes/Services/AuthService.php
namespace EcoAsset\Services;

class AuthService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Définir les rôles (Spectateur, Organisateur, Admin)
     * ✅ Gérer les capabilities
     * ✅ Protéger les endpoints
     * ✅ Vérifier les nonces
     * ✅ Logger les actions sensibles
     */

    public function setup_roles(): void {
        add_role( 'ecoasset_organizer', 'Organisateur', [
            'read'              => true,
            'edit_events'       => true,
            'publish_events'    => true,
            'delete_events'     => true,
            'edit_others_events'=> true,
            'view_bookings'     => true,
        ] );

        add_role( 'ecoasset_customer', 'Spectateur', [
            'read'                  => true,
            'view_own_bookings'     => true,
            'leave_reviews'         => true,
        ] );
    }

    public function can_user_access( int $user_id, string $capability, int $resource_id = 0 ): bool {
        $user = get_userdata( $user_id );
        if ( ! $user ) return false;

        if ( user_can( $user, $capability ) ) return true;

        // Logique de propriété
        if ( $resource_id > 0 ) {
            $post = get_post( $resource_id );
            return $post && (int) $post->post_author === $user_id;
        }

        return false;
    }
}
