<?php
// includes/Services/NotificationService.php
namespace EcoAsset\Services;

class NotificationService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Emails transactionnels (confirmation, annulation, rappel)
     * ✅ SMS (optionnel)
     * ✅ Notifications push (web)
     * ✅ Templates d'emails personnalisables
     * ✅ Logs d'envoi
     */

    public function send( int $user_id, string $template, array $data = [] ): bool {
        $user = get_userdata( $user_id );
        if ( ! $user ) return false;

        $template_data = $this->get_template( $template );
        if (!$template_data) return false;

        $message = $this->render_template( $template_data['body'], $data );

        return wp_mail(
            $user->user_email,
            $this->render_template( $template_data['subject'], $data ),
            $message,
            [ 'Content-Type: text/html; charset=UTF-8' ]
        );
    }

    public function send_booking_confirmation( object $booking ): void {
        $this->send( $booking->user_id, 'booking_confirmed', [
            'booking_ref' => $booking->booking_ref,
            'event_title' => get_the_title( $booking->event_id ),
            'total'       => $booking->total,
        ] );
    }

    private function get_template( string $name ): ?array {
        // En vrai: charger depuis les options ou un fichier de templates
        $templates = [
            'booking_confirmed' => [
                'subject' => 'Confirmation de votre réservation {booking_ref}',
                'body' => 'Merci pour votre achat pour l\'événement {event_title}. Total: {total}€.'
            ],
            'event_created' => [
                'subject' => 'Événement publié avec succès',
                'body' => 'Votre événement est en ligne.'
            ]
        ];
        return $templates[$name] ?? null;
    }

    private function render_template( string $content, array $data ): string {
        foreach ($data as $key => $val) {
            $content = str_replace( '{' . $key . '}', $val, $content );
        }
        return $content;
    }
}
