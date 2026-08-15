<?php
// includes/Services/TicketService.php
namespace EcoAsset\Services;

class TicketService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Définir les types de billets (Standard, Premium, VIP)
     * ✅ Gérer la tarification (prix normal, réduit, soldes)
     * ✅ Suivre la disponibilité par type
     * ✅ Appliquer les règles de quantité (min/max par commande)
     * ✅ Gérer les inclusions (avantages VIP, etc.)
     */

    private $db;
    private $table;

    public function __construct() {
        global $wpdb;
        $this->db = $wpdb;
        $this->table = $wpdb->prefix . 'ecoasset_tickets';
    }

    /**
     * Crée un type de ticket pour un événement
     */
    public function create( int $event_id, array $data ): int|\WP_Error {
        // Validation
        if ( $data['price'] < 0 ) {
            return new \WP_Error( 'invalid_price', 'Le prix ne peut pas être négatif' );
        }

        $result = $this->db->insert(
            $this->table,
            [
                'event_id'        => $event_id,
                'name'            => sanitize_text_field( $data['name'] ),
                'description'     => sanitize_textarea_field( $data['description'] ?? '' ),
                'price'           => floatval( $data['price'] ),
                'sale_price'      => floatval( $data['sale_price'] ?? 0 ),
                'quantity_total'  => intval( $data['quantity_total'] ?? -1 ),
                'quantity_sold'   => 0,
                'min_per_order'   => intval( $data['min_per_order'] ?? 1 ),
                'max_per_order'   => intval( $data['max_per_order'] ?? 10 ),
                'is_vip'          => ! empty( $data['is_vip'] ) ? 1 : 0,
                'includes'        => json_encode( $data['includes'] ?? [] ),
                'sale_starts_at'  => $data['sale_starts_at'] ?? null,
                'sale_ends_at'    => $data['sale_ends_at'] ?? null,
                'created_at'      => current_time( 'mysql' ),
            ],
            [ '%d', '%s', '%s', '%f', '%f', '%d', '%d', '%d', '%d', '%d', '%s', '%s', '%s', '%s' ]
        );

        if ( $result === false ) {
            return new \WP_Error( 'db_error', 'Erreur lors de la création' );
        }

        return $this->db->insert_id;
    }

    /**
     * Récupère tous les tickets d'un événement
     */
    public function get_event_tickets( int $event_id ): array {
        return $this->db->get_results( $this->db->prepare(
            "SELECT * FROM {$this->table} WHERE event_id = %d ORDER BY price ASC",
            $event_id
        ) );
    }

    /**
     * Calcule le prix minimum d'un événement
     */
    public function get_min_price( int $event_id ): float {
        $result = $this->db->get_var( $this->db->prepare(
            "SELECT MIN(price) FROM {$this->table} WHERE event_id = %d",
            $event_id
        ) );
        return (float) $result;
    }

    /**
     * Vérifie la disponibilité restante
     */
    public function get_remaining( int $ticket_id ): int {
        $ticket = $this->db->get_row( $this->db->prepare(
            "SELECT quantity_total, quantity_sold FROM {$this->table} WHERE id = %d",
            $ticket_id
        ) );

        if ( ! $ticket ) return 0;
        if ( $ticket->quantity_total === '-1' ) return -1; // Illimité

        return max( 0, (int) $ticket->quantity_total - (int) $ticket->quantity_sold );
    }

    /**
     * Calcule le prix actuel (avec sale_price si applicable)
     */
    public function get_current_price( int $ticket_id ): float {
        $ticket = $this->get_by_id( $ticket_id );
        if ( ! $ticket ) return 0;

        $now = time();
        $sale_start = $ticket->sale_starts_at ? strtotime( $ticket->sale_starts_at ) : 0;
        $sale_end   = $ticket->sale_ends_at   ? strtotime( $ticket->sale_ends_at )   : PHP_INT_MAX;

        if ( $ticket->sale_price > 0 && $now >= $sale_start && $now <= $sale_end ) {
            return (float) $ticket->sale_price;
        }

        return (float) $ticket->price;
    }

    /**
     * Réserve des billets (décrémente le stock)
     */
    public function reserve( int $ticket_id, int $quantity ): bool|\WP_Error {
        $remaining = $this->get_remaining( $ticket_id );
        if ( $remaining !== -1 && $quantity > $remaining ) {
            return new \WP_Error( 'insufficient_stock', 
                sprintf( 'Seulement %d billets disponibles', $remaining )
            );
        }

        return $this->db->query( $this->db->prepare(
            "UPDATE {$this->table} SET quantity_sold = quantity_sold + %d WHERE id = %d",
            $quantity, $ticket_id
        ) ) !== false;
    }

    public function get_by_id( int $ticket_id ): ?object {
        return $this->db->get_row( $this->db->prepare(
            "SELECT * FROM {$this->table} WHERE id = %d",
            $ticket_id
        ) );
    }
}
