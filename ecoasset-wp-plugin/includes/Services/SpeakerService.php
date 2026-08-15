<?php
// includes/Services/SpeakerService.php
namespace EcoAsset\Services;

class SpeakerService {

    /**
     * RÔLE DU SERVICE
     * 
     * Responsabilités :
     * ✅ Fiche descriptive des artistes/speakers
     * ✅ Association speaker ↔ événement(s)
     * ✅ Bio, photo, réseaux sociaux
     * ✅ Horaires de passage
     */

    public function create( array $data ): int {
        $speaker_id = wp_insert_post([
            'post_type'   => 'ecoasset_speaker',
            'post_title'  => sanitize_text_field( $data['name'] ),
            'post_content'=> wp_kses_post( $data['bio'] ?? '' ),
        ]);

        update_post_meta( $speaker_id, '_speaker_role', $data['role'] ?? '' );
        update_post_meta( $speaker_id, '_speaker_social', wp_json_encode( $data['social'] ?? [] ) );
        
        return $speaker_id;
    }

    public function attach_to_event( int $speaker_id, int $event_id ): void {
        $events = get_post_meta( $speaker_id, '_speaker_events', true ) ?: [];
        $events[] = $event_id;
        update_post_meta( $speaker_id, '_speaker_events', array_unique( $events ) );
    }
}
