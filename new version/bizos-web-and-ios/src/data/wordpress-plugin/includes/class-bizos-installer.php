<?php
namespace BizosIdentity\Core;

if ( ! defined( 'ABSPATH' ) ) exit;

class Bizos_Installer {

    public static function activate() {
        if ( class_exists( '\\BizosIdentity\\Core\\Bizos_Database' ) ) {
            $db = new \BizosIdentity\Core\Bizos_Database();
            $db->install();
        }

        add_option( 'bizos_force_2fa_admins', 1 );
        add_option( 'bizos_failed_attempts_lock', 5 );
        add_option( 'bizos_lockout_duration', 15 );
        add_option( 'bizos_db_version', BIZOS_IDENTITY_DB_VERSION );

        flush_rewrite_rules();
    }

    public static function deactivate() {
        flush_rewrite_rules();
    }
}
