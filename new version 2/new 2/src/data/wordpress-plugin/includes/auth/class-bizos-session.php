<?php
namespace BizosIdentity\Auth;

if ( ! defined( 'ABSPATH' ) ) exit;

class Bizos_Session {

    public function get_active_sessions( $user_id ) {
        global $wpdb;
        $table = $wpdb->prefix . 'bizos_sessions';
        return $wpdb->get_results( $wpdb->prepare(
            "SELECT * FROM {$table} WHERE user_id = %d AND status = 'ACTIVE'",
            $user_id
        ) );
    }
}
