<?php
namespace BizosIdentity\Admin;

if ( ! defined( 'ABSPATH' ) ) exit;

class Bizos_Admin {

    public function init() {
        add_action( 'admin_menu', [ $this, 'add_menu' ] );
    }

    public function add_menu() {
        add_menu_page(
            __( 'BizOS Identity', 'bizos-identity' ),
            __( '🔒 Identity', 'bizos-identity' ),
            'manage_options',
            'bizos-identity',
            [ $this, 'render_dashboard' ],
            'dashicons-lock',
            30
        );
    }

    public function render_dashboard() {
        ?>
        <div class="wrap">
            <h1>🔒 BizOS Identity — Tableau de bord</h1>
            <p>Bienvenue dans l'extension BizOS Identity pour WordPress. Authentification sécurisée par lien magique et 2FA TOTP.</p>
        </div>
        <?php
    }
}
