<?php
/*
Plugin Name: BizOS Identity
Plugin URI: https://bizos.app/wordpress
Description: Passwordless login with magic links, 2FA TOTP, multi-device session management, and audit log for WordPress.
Version: 2.1.0
Requires at least: 6.4
Requires PHP: 8.1
Author: BizOS Inc.
Author URI: https://bizos.app
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html
Text Domain: bizos-identity
Domain Path: /languages
*/

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Plugin constants
define( 'BIZOS_IDENTITY_VERSION', '2.1.0' );
define( 'BIZOS_IDENTITY_FILE', __FILE__ );
define( 'BIZOS_IDENTITY_PATH', plugin_dir_path( __FILE__ ) );
define( 'BIZOS_IDENTITY_URL', plugin_dir_url( __FILE__ ) );
define( 'BIZOS_IDENTITY_SLUG', 'bizos-identity' );
define( 'BIZOS_IDENTITY_DB_VERSION', '2.1.0' );

// Autoloader PSR-4
spl_autoload_register( function ( $class ) {
    $prefix = 'BizosIdentity\\';
    $base_dir = BIZOS_IDENTITY_PATH . 'includes/';
    
    $len = strlen( $prefix );
    if ( strncmp( $prefix, $class, $len ) !== 0 ) {
        return;
    }
    
    $relative_class = substr( $class, $len );
    $file = $base_dir . str_replace( '\\', '/', $relative_class ) . '.php';
    
    if ( file_exists( $file ) ) {
        require_once $file;
    }
});

// Bootstrap plugin
if ( file_exists( BIZOS_IDENTITY_PATH . 'includes/class-bizos-identity.php' ) ) {
    require_once BIZOS_IDENTITY_PATH . 'includes/class-bizos-identity.php';
}

// Initialize
add_action( 'plugins_loaded', function() {
    if ( class_exists( '\\BizosIdentity\\Core\\Bizos_Identity' ) ) {
        \BizosIdentity\Core\Bizos_Identity::instance()->init();
    }
} );

// Activation/Deactivation hooks
register_activation_hook( __FILE__, function() {
    if ( class_exists( '\\BizosIdentity\\Core\\Bizos_Installer' ) ) {
        \BizosIdentity\Core\Bizos_Installer::activate();
    }
} );

register_deactivation_hook( __FILE__, function() {
    if ( class_exists( '\\BizosIdentity\\Core\\Bizos_Installer' ) ) {
        \BizosIdentity\Core\Bizos_Installer::deactivate();
    }
} );
