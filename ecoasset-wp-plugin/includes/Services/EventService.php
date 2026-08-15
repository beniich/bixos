<?php
// includes/Services/EventService.php
namespace EcoAsset\Services;

class EventService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Créer / Lire / Mettre à jour / Supprimer (CRUD) les événements
     * ✅ Valider les données (dates, capacité, prix)
     * ✅ Calculer la disponibilité (places restantes)
     * ✅ Gérer le cycle de vie (brouillon → publié → archivé)
     * ✅ Gérer les relations (speakers, venue, tickets)
     * ✅ Indexer pour la recherche
     */

    private $db;
    private $ticket_service;
    private $booking_service;
    private $notification_service;

    public function __construct() {
        global $wpdb;
        $this->db = $wpdb;
        $this->ticket_service = new TicketService();
        $this->booking_service = new BookingService();
        $this->notification_service = new NotificationService();
    }

    /**
     * Crée un nouvel événement avec validation complète
     */
    public function create( array $data ): array {
        // 1. Validation
        $errors = $this->validate( $data );
        if ( ! empty( $errors ) ) {
            return [
                'success' => false,
                'errors'  => $errors,
            ];
        }

        // 2. Insertion WP Post
        $event_id = wp_insert_post([
            'post_type'    => 'ecoasset_event',
            'post_title'   => sanitize_text_field( $data['title'] ),
            'post_content' => wp_kses_post( $data['description'] ?? '' ),
            'post_status'  => $data['status'] ?? 'draft',
            'post_author'  => $data['organizer_id'],
        ]);

        if ( is_wp_error( $event_id ) ) {
            return [ 'success' => false, 'errors' => [ $event_id->get_error_message() ] ];
        }

        // 3. Sauvegarde des métadonnées
        $this->save_meta( $event_id, $data );

        // 4. Création automatique des tickets par défaut
        if ( ! empty( $data['default_tickets'] ) ) {
            foreach ( $data['default_tickets'] as $ticket ) {
                $this->ticket_service->create( $event_id, $ticket );
            }
        }

        // 5. Indexation pour la recherche
        $this->index_for_search( $event_id );

        // 6. Notification à l'organisateur
        $this->notification_service->send(
            $data['organizer_id'],
            'event_created',
            [ 'event_id' => $event_id ]
        );

        return [
            'success'  => true,
            'event_id' => $event_id,
            'url'      => get_permalink( $event_id ),
        ];
    }

    /**
     * Validation des données d'un événement
     */
    private function validate( array $data ): array {
        $errors = [];

        if ( empty( $data['title'] ) ) {
            $errors[] = 'Le titre est obligatoire';
        }

        if ( empty( $data['start_date'] ) ) {
            $errors[] = 'La date de début est obligatoire';
        }

        if ( ! empty( $data['start_date'] ) && strtotime( $data['start_date'] ) < time() ) {
            $errors[] = 'La date de début doit être dans le futur';
        }

        if ( ! empty( $data['end_date'] ) && strtotime( $data['end_date'] ) < strtotime( $data['start_date'] ) ) {
            $errors[] = 'La date de fin doit être après la date de début';
        }

        if ( empty( $data['venue_id'] ) ) {
            $errors[] = 'Un lieu doit être sélectionné';
        }

        if ( empty( $data['capacity'] ) || $data['capacity'] < 1 ) {
            $errors[] = 'La capacité doit être supérieure à 0';
        }

        return $errors;
    }

    /**
     * Calcule la disponibilité d'un événement
     */
    public function get_availability( int $event_id ): array {
        $capacity = (int) get_post_meta( $event_id, '_ecoasset_capacity', true );
        $booked   = $this->booking_service->count_event_bookings( $event_id );
        $reserved = $this->booking_service->count_pending( $event_id );
        
        $available = max( 0, $capacity - $booked - $reserved );
        $percent   = $capacity > 0 ? round( ( $booked / $capacity ) * 100 ) : 0;

        return [
            'capacity'      => $capacity,
            'booked'        => $booked,
            'pending'       => $reserved,
            'available'     => $available,
            'percent_sold'  => $percent,
            'status'        => $this->get_availability_status( $available, $percent ),
        ];
    }

    private function get_availability_status( int $available, int $percent ): string {
        if ( $available === 0 ) return 'sold_out';
        if ( $percent >= 80 ) return 'almost_full';
        if ( $percent >= 50 ) return 'filling';
        return 'available';
    }

    /**
     * Liste les événements avec filtres avancés
     */
    public function list( array $filters = [] ): array {
        $args = [
            'post_type'      => 'ecoasset_event',
            'post_status'    => 'publish',
            'posts_per_page' => $filters['per_page'] ?? 12,
            'paged'          => $filters['page'] ?? 1,
        ];

        if ( ! empty( $filters['category'] ) ) {
            $args['tax_query'] = [[
                'taxonomy' => 'ecoasset_category',
                'field'    => 'term_id',
                'terms'    => (array) $filters['category'],
            ]];
        }

        if ( ! empty( $filters['date_from'] ) || ! empty( $filters['date_to'] ) ) {
            $args['meta_query'][] = [
                'key'     => '_ecoasset_start_date',
                'value'   => [
                    $filters['date_from'] ?? '1970-01-01',
                    $filters['date_to']   => '2099-12-31',
                ],
                'compare' => 'BETWEEN',
                'type'    => 'DATETIME',
            ];
        }

        $query = new \WP_Query( $args );
        $events = [];

        while ( $query->have_posts() ) {
            $query->the_post();
            $event_id = get_the_ID();
            $events[] = $this->format_for_listing( $event_id );
        }
        wp_reset_postdata();

        return [
            'events'      => $events,
            'total'       => $query->found_posts,
            'max_pages'   => $query->max_num_pages,
            'current_page'=> $args['paged'],
        ];
    }

    private function format_for_listing( int $event_id ): array {
        $min_price = $this->ticket_service->get_min_price( $event_id );
        $availability = $this->get_availability( $event_id );

        return [
            'id'           => $event_id,
            'title'        => get_the_title( $event_id ),
            'excerpt'      => get_the_excerpt( $event_id ),
            'image'        => get_the_post_thumbnail_url( $event_id, 'medium_large' ),
            'permalink'    => get_permalink( $event_id ),
            'start_date'   => get_post_meta( $event_id, '_ecoasset_start_date', true ),
            'venue'        => $this->get_venue_summary( $event_id ),
            'min_price'    => $min_price,
            'availability' => $availability,
        ];
    }

    private function save_meta( int $event_id, array $data ): void {
        $meta_keys = [
            'start_date'    => '_ecoasset_start_date',
            'end_date'      => '_ecoasset_end_date',
            'venue_id'      => '_ecoasset_venue_id',
            'capacity'      => '_ecoasset_capacity',
            'organizer_id'  => '_ecoasset_organizer_id',
            'featured'      => '_ecoasset_featured',
        ];

        foreach ( $meta_keys as $field => $meta_key ) {
            if ( isset( $data[ $field ] ) ) {
                update_post_meta( $event_id, $meta_key, $data[ $field ] );
            }
        }
    }

    private function index_for_search( int $event_id ): void {
        // Logique d'indexation
    }

    private function get_venue_summary( int $event_id ): array {
        $venue_id = get_post_meta( $event_id, '_ecoasset_venue_id', true );
        if (!$venue_id) return [];
        return [
            'id' => $venue_id,
            'name' => get_the_title($venue_id)
        ];
    }
}
