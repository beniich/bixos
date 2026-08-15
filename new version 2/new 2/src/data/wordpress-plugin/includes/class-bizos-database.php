<?php
namespace BizosIdentity\Core;

if ( ! defined( 'ABSPATH' ) ) exit;

class Bizos_Database {

    public function install() {
        global $wpdb;
        $charset_collate = $wpdb->get_charset_collate();
        $prefix = $wpdb->prefix . 'bizos_';

        require_once ABSPATH . 'wp-admin/includes/upgrade.php';

        $sql_magic_links = "CREATE TABLE {$prefix}magic_links (
            id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(254) NOT NULL,
            token_hash VARCHAR(64) NOT NULL,
            expires_at DATETIME NOT NULL,
            used_at DATETIME NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
        ) $charset_collate;";

        $sql_sessions = "CREATE TABLE {$prefix}sessions (
            id VARCHAR(36) PRIMARY KEY,
            user_id BIGINT UNSIGNED NOT NULL,
            ip_address VARCHAR(45) NULL,
            device_name VARCHAR(100) NULL,
            last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            status VARCHAR(20) DEFAULT 'ACTIVE' NOT NULL
        ) $charset_collate;";

        dbDelta( $sql_magic_links );
        dbDelta( $sql_sessions );
    }
}
