<?php
/**
 * Plugin Name: EcoAsset
 * Plugin URI: https://ecoasset.com
 * Description: Plateforme complète de billetterie événementielle et gestion d'assets.
 * Version: 1.0.0
 * Author: BizOS
 * License: GPL-2.0+
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

define( 'ECOASSET_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
define( 'ECOASSET_PLUGIN_URL', plugin_dir_url( __FILE__ ) );

// Autoloader basique pour l'architecture en cours
spl_autoload_register(function ($class) {
    // Prefix du projet
    $prefix = 'EcoAsset\\';

    // Base directory pour le namespace du prefix
    $base_dir = ECOASSET_PLUGIN_DIR . 'includes/';

    // Est-ce que la classe utilise le prefix?
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }

    // Récupérer le nom relatif de la classe
    $relative_class = substr($class, $len);

    // Remplacer les séparateurs de namespace par des séparateurs de dossier
    $file = $base_dir . str_replace('\\', '/', $relative_class) . '.php';

    // Si le fichier existe, l'exiger
    if (file_exists($file)) {
        require $file;
    }
});

// Bootstrapping du Plugin
function run_ecoasset() {
    \EcoAsset\Plugin::init();
}
add_action( 'plugins_loaded', 'run_ecoasset' );
