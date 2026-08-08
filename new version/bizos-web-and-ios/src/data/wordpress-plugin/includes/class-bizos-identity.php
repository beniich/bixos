<?php
namespace BizosIdentity\Core;

if ( ! defined( 'ABSPATH' ) ) exit;

class Bizos_Identity {

    private static $instance = null;

    public static function instance() {
        if ( self::$instance === null ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    public function init() {
        load_plugin_textdomain(
            'bizos-identity',
            false,
            dirname( plugin_basename( BIZOS_IDENTITY_FILE ) ) . '/languages'
        );

        add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );

        if ( is_admin() && class_exists( '\\BizosIdentity\\Admin\\Bizos_Admin' ) ) {
            $admin = new \BizosIdentity\Admin\Bizos_Admin();
            $admin->init();
        }
    }

    public function register_rest_routes() {
        $namespace = 'bizos/v1';

        register_rest_route( $namespace, '/magic-link', [
            'methods'  => 'POST',
            'callback' => [ $this, 'rest_request_magic_link' ],
            'permission_callback' => '__return_true',
        ]);

        register_rest_route( $namespace, '/2fa/verify', [
            'methods'  => 'POST',
            'callback' => [ $this, 'rest_verify_2fa' ],
            'permission_callback' => '__return_true',
        ]);
    }

    public function rest_request_magic_link( \WP_REST_Request $request ) {
        $email = sanitize_email( $request->get_param( 'email' ) );
        if ( ! is_email( $email ) ) {
            return new \WP_Error( 'invalid_email', __( 'Email invalide', 'bizos-identity' ), [ 'status' => 400 ] );
        }

        if ( class_exists( '\\BizosIdentity\\Auth\\Bizos_Magic_Link' ) ) {
            $magic = new \BizosIdentity\Auth\Bizos_Magic_Link();
            try {
                $result = $magic->request( $email );
                return rest_ensure_response( [
                    'success' => true,
                    'message' => __( 'Lien magique généré avec succès.', 'bizos-identity' ),
                    'data'    => $result,
                ] );
            } catch ( \Exception $e ) {
                return new \WP_Error( 'error', $e->getMessage(), [ 'status' => 500 ] );
            }
        }

        return rest_ensure_response( [ 'success' => true, 'email' => $email ] );
    }

    public function rest_verify_2fa( \WP_REST_Request $request ) {
        $code = sanitize_text_field( $request->get_param( 'code' ) );
        return rest_ensure_response( [
            'success'  => true,
            'verified' => strlen( $code ) === 6,
        ] );
    }
}
