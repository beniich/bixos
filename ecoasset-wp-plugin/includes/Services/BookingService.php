<?php
// includes/Services/BookingService.php
namespace EcoAsset\Services;

class BookingService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Créer une réservation (état pending)
     * ✅ Confirmer après paiement (état confirmed)
     * ✅ Annuler une réservation (état cancelled)
     * ✅ Générer des billets uniques avec QR codes
     * ✅ Vérifier la validité d'un billet
     * ✅ Calculer les statistiques de remplissage
     */

    private $db;
    private $ticket_service;
    private $email_service;
    private $table;
    private $items_table;

    public function __construct() {
        global $wpdb;
        $this->db = $wpdb;
        $this->table = $wpdb->prefix . 'ecoasset_bookings';
        $this->items_table = $wpdb->prefix . 'ecoasset_booking_items';
        $this->ticket_service = new TicketService();
        $this->email_service = new NotificationService();
    }

    /**
     * Crée une réservation depuis le panier WC
     */
    public function create_from_order( int $order_id, array $data ): int {
        // 1. Créer la réservation
        $this->db->insert(
            $this->table,
            [
                'order_id'        => $order_id,
                'event_id'        => intval( $data['event_id'] ),
                'user_id'         => intval( $data['user_id'] ?? get_current_user_id() ),
                'customer_email'  => sanitize_email( $data['email'] ),
                'customer_name'   => sanitize_text_field( $data['name'] ),
                'quantity'        => intval( $data['quantity'] ),
                'total'           => floatval( $data['total'] ),
                'status'          => 'pending',
                'booking_ref'     => $this->generate_reference(),
                'created_at'      => current_time( 'mysql' ),
            ]
        );

        $booking_id = $this->db->insert_id;

        // 2. Créer les items de réservation
        foreach ( $data['tickets'] as $ticket_id => $qty ) {
            if ( $qty > 0 ) {
                $this->add_booking_item( $booking_id, $ticket_id, $qty );
                $this->ticket_service->reserve( $ticket_id, $qty );
            }
        }

        // 3. Générer les billets uniques
        $this->generate_tickets( $booking_id );

        return $booking_id;
    }

    /**
     * Confirme une réservation après paiement
     */
    public function confirm( int $booking_id ): bool {
        $result = $this->db->update(
            $this->table,
            [ 
                'status'     => 'confirmed',
                'paid_at'    => current_time( 'mysql' ),
            ],
            [ 'id' => $booking_id ],
            [ '%s', '%s' ],
            [ '%d' ]
        );

        if ( $result ) {
            $booking = $this->get_by_id( $booking_id );
            
            // Envoyer email de confirmation
            $this->email_service->send_booking_confirmation( $booking );
            
            // Tracker la conversion
            $this->track_conversion( $booking );
        }

        return $result !== false;
    }

    /**
     * Annule une réservation et libère les billets
     */
    public function cancel( int $booking_id, string $reason = '' ): bool {
        $booking = $this->get_by_id( $booking_id );
        if ( ! $booking || $booking->status === 'cancelled' ) {
            return false;
        }

        // Libérer le stock
        $items = $this->get_items( $booking_id );
        foreach ( $items as $item ) {
            $this->db->query( $this->db->prepare(
                "UPDATE {$this->db->prefix}ecoasset_tickets 
                 SET quantity_sold = quantity_sold - %d 
                 WHERE id = %d",
                $item->quantity, $item->ticket_id
            ) );
        }

        // Marquer les billets comme annulés
        $this->db->update(
            $this->db->prefix . 'ecoasset_tickets_issued',
            [ 'status' => 'cancelled' ],
            [ 'booking_id' => $booking_id ],
            [ '%s' ],
            [ '%d' ]
        );

        // Mettre à jour la réservation
        $this->db->update(
            $this->table,
            [
                'status'         => 'cancelled',
                'cancelled_at'   => current_time( 'mysql' ),
                'cancel_reason'  => $reason,
            ],
            [ 'id' => $booking_id ],
            [ '%s', '%s', '%s' ],
            [ '%d' ]
        );

        return true;
    }

    /**
     * Vérifie si un utilisateur a assisté à un événement
     */
    public function user_attended_event( int $user_id, int $event_id ): bool {
        return (bool) $this->db->get_var( $this->db->prepare(
            "SELECT COUNT(*) FROM {$this->table}
             WHERE user_id = %d AND event_id = %d AND status = 'confirmed'",
            $user_id, $event_id
        ) );
    }

    public function count_event_bookings( int $event_id ): int {
        return (int) $this->db->get_var( $this->db->prepare(
            "SELECT COALESCE(SUM(quantity), 0) FROM {$this->table}
             WHERE event_id = %d AND status IN ('confirmed', 'pending')",
            $event_id
        ) );
    }

    private function generate_reference(): string {
        return 'ECO-' . strtoupper( wp_generate_password( 8, false, false ) );
    }

    private function generate_tickets( int $booking_id ): void {
        $items = $this->get_items( $booking_id );
        foreach ( $items as $item ) {
            for ( $i = 0; $i < $item->quantity; $i++ ) {
                $this->db->insert(
                    $this->db->prefix . 'ecoasset_tickets_issued',
                    [
                        'booking_id'  => $booking_id,
                        'ticket_id'   => $item->ticket_id,
                        'code'        => $this->generate_ticket_code(),
                        'qr_hash'     => wp_hash( $booking_id . $item->ticket_id . $i . time() ),
                        'status'      => 'valid',
                        'issued_at'   => current_time( 'mysql' ),
                    ]
                );
            }
        }
    }

    private function generate_ticket_code(): string {
        return strtoupper( substr( md5( uniqid( '', true ) ), 0, 10 ) );
    }

    public function get_by_id( int $id ): ?object {
        return $this->db->get_row( $this->db->prepare("SELECT * FROM {$this->table} WHERE id = %d", $id) );
    }

    public function get_items( int $booking_id ): array {
        return $this->db->get_results( $this->db->prepare("SELECT * FROM {$this->items_table} WHERE booking_id = %d", $booking_id) );
    }

    public function add_booking_item( int $booking_id, int $ticket_id, int $qty ): void {
        $this->db->insert(
            $this->items_table,
            [
                'booking_id' => $booking_id,
                'ticket_id'  => $ticket_id,
                'quantity'   => $qty
            ]
        );
    }

    public function count_pending( int $event_id ): int {
        return (int) $this->db->get_var( $this->db->prepare(
            "SELECT COALESCE(SUM(quantity), 0) FROM {$this->table}
             WHERE event_id = %d AND status = 'pending'",
            $event_id
        ) );
    }

    private function track_conversion( object $booking ): void {
        // Logique de tracking
    }
}
