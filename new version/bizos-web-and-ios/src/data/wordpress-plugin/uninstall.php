<?php
/**
 * BizOS Identity Uninstall Handler
 * Fired when plugin is uninstalled from WordPress.
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
    exit;
}

global $wpdb;

$tables = [
    'magic_links', 'password_history', 'sessions',
    'two_factor_secrets', 'audit_log', 'lockouts', 'trusted_devices'
];

foreach ( $tables as $table ) {
    $wpdb->query( "DROP TABLE IF EXISTS {$wpdb->prefix}bizos_{$table}" );
}

$options = [
    'bizos_db_version', 'bizos_settings', 'bizos_jwt_secret', 'bizos_encryption_key',
    'bizos_hcaptcha_site_key', 'bizos_hcaptcha_secret',
    'bizos_force_2fa_admins', 'bizos_force_2fa_all',
    'bizos_failed_attempts_lock', 'bizos_lockout_duration',
    'bizos_login_logo',
];

foreach ( $options as $option ) {
    delete_option( $option );
    delete_site_option( $option );
}

flush_rewrite_rules();
