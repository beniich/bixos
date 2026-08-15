<?php
namespace EcoAsset;

use EcoAsset\Services\{
    EventService, TicketService, BookingService, PaymentService,
    VenueService, SpeakerService, ReviewService, LoyaltyService,
    NotificationService, AuthService
};

class Plugin {

    /**
     * Conteneur de services (Singleton)
     */
    private static array $services = [];

    public static function init(): void {
        self::register_services();
        self::register_hooks();
    }

    private static function register_services(): void {
        self::$services['event']        = new EventService();
        self::$services['ticket']       = new TicketService();
        self::$services['booking']      = new BookingService();
        self::$services['payment']      = new PaymentService();
        self::$services['venue']        = new VenueService();
        self::$services['speaker']      = new SpeakerService();
        self::$services['review']       = new ReviewService();
        self::$services['loyalty']      = new LoyaltyService();
        self::$services['notification'] = new NotificationService();
        self::$services['auth']         = new AuthService();
    }

    private static function register_hooks(): void {
        // Enregistrer les hooks globaux
        add_action( 'init', [ self::class, 'register_post_types' ] );
        add_action( 'init', [ self::$services['auth'], 'setup_roles' ] );
    }

    public static function register_post_types(): void {
        // Exemple simple: laisser le code d'enregistrement des CPTs ici ou appeler les services
    }

    /**
     * Accès au conteneur IoC
     */
    public static function service( string $name ): mixed {
        if ( ! isset( self::$services[ $name ] ) ) {
            throw new \Exception( "Service {$name} not found" );
        }
        return self::$services[ $name ];
    }

    /**
     * Raccourci : EcoAsset::event()->list()
     */
    public static function event(): EventService   { return self::$services['event']; }
    public static function ticket(): TicketService  { return self::$services['ticket']; }
    public static function booking(): BookingService{ return self::$services['booking']; }
    public static function payment(): PaymentService{ return self::$services['payment']; }
    public static function venue(): VenueService   { return self::$services['venue']; }
    public static function speaker(): SpeakerService{ return self::$services['speaker']; }
    public static function review(): ReviewService { return self::$services['review']; }
    public static function loyalty(): LoyaltyService{ return self::$services['loyalty']; }
    public static function notification(): NotificationService { 
        return self::$services['notification']; 
    }
    public static function auth(): AuthService     { return self::$services['auth']; }
}
