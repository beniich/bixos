<?php
namespace BizosIdentity;

if ( ! defined( 'ABSPATH' ) ) exit;

class Bizos_License {

    private const API_BASE = 'https://bizos.ricecloud.net/api';
    private const TRANSIENT_KEY = 'bizos_license_data';
    private const GRACE_PERIOD_HOURS = 24;
    private const CACHE_DURATION = 43200; // 12 hours

    public function __construct() {
        add_action( 'admin_init', [ $this, 'handle_activation_form' ] );
        add_action( 'bizos_daily_cron', [ $this, 'daily_license_check' ] );
        
        add_filter( 'bizos_feature_avail', [ $this, 'check_license_for_feature' ], 5, 2 );
    }

    public function handle_activation_form() {
        if ( ! isset( $_POST['bizos_activate_license'] ) ) return;
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_die( esc_html__( 'Accès non autorisé.', 'bizos-identity' ) );
        }
        check_admin_referer( 'bizos_license_action' );

        $key = sanitize_text_field( $_POST['bizos_license_key'] ?? '' );

        if ( empty( $key ) ) {
            add_settings_error( 'bizos_license', 'empty_key', __( 'Veuillez saisir une clé de licence valide.', 'bizos-identity' ) );
            return;
        }

        if ( ! $this->is_valid_format( $key ) ) {
            add_settings_error( 'bizos_license', 'invalid_format', __( 'Format de clé de licence invalide (ex: BIZOS-PRO-XXXX-XXXX-XXXX).', 'bizos-identity' ) );
            return;
        }

        $result = $this->validate_remote( $key, true );

        if ( is_wp_error( $result ) ) {
            add_settings_error(
                'bizos_license',
                'api_error',
                sprintf( __( 'Échec de la validation distante : %s', 'bizos-identity' ), $result->get_error_message() )
            );
            return;
        }

        if ( empty( $result['valid'] ) ) {
            $error_messages = [
                'LICENSE_NOT_FOUND'      => __( 'Cette clé de licence n\'existe pas.', 'bizos-identity' ),
                'LICENSE_EXPIRED'       => __( 'Votre licence a expiré. Veuillez la renouveler.', 'bizos-identity' ),
                'LICENSE_REVOKED'       => __( 'Cette licence a été révoquée.', 'bizos-identity' ),
                'DOMAIN_LIMIT_EXCEEDED' => __( 'Limite de domaines atteinte pour cette licence.', 'bizos-identity' ),
                'DOMAIN_NOT_AUTHORIZED' => __( 'Ce domaine n\'est pas autorisé pour cette licence.', 'bizos-identity' ),
            ];
            $error_key = $result['error'] ?? 'UNKNOWN';
            add_settings_error(
                'bizos_license',
                'invalid_license',
                $error_messages[ $error_key ] ?? __( 'Validation de la licence échouée.', 'bizos-identity' )
            );
            return;
        }

        update_option( 'bizos_license_key', $key );
        update_option( 'bizos_license_data', $result['license'] );
        update_option( 'bizos_license_signed', $result['signedPayload'] ?? '' );
        update_option( 'bizos_license_activated_at', time() );
        update_option( 'bizos_license_cache_expires', time() + self::CACHE_DURATION );

        add_settings_error(
            'bizos_license',
            'activated',
            sprintf(
                __( '✅ Licence activée avec succès ! Niveau : %s, Fonctionnalités débloquées : %d', 'bizos-identity' ),
                strtoupper( esc_html( $result['license']['tier'] ?? 'pro' ) ),
                count( $result['license']['features'] ?? [] )
            ),
            'success'
        );
    }

    private function validate_remote( $key, $activate = true ) {
        $site_data = $this->get_site_fingerprint();

        $response = wp_remote_post( self::API_BASE . '/licenses/validate', [
            'timeout' => 15,
            'headers' => [
                'Content-Type' => 'application/json',
                'User-Agent'   => 'BizosIdentity/' . BIZOS_IDENTITY_VERSION,
            ],
            'body' => wp_json_encode( array_merge( $site_data, [
                'key'      => $key,
                'activate' => $activate,
            ] ) ),
        ] );

        if ( is_wp_error( $response ) ) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code( $response );
        $body = json_decode( wp_remote_retrieve_body( $response ), true );

        if ( $code === 503 ) {
            return $this->check_grace_period();
        }

        return $body ?? [ 'valid' => false, 'error' => 'INVALID_RESPONSE' ];
    }

    private function get_site_fingerprint() {
        $url = home_url();
        $domain = wp_parse_url( $url, PHP_URL_HOST );
        return [
            'domain'        => $domain ?: 'localhost',
            'siteUrl'       => $url,
            'siteHash'      => hash( 'sha256', $domain . '|' . wp_salt() ),
            'pluginVersion' => defined( 'BIZOS_IDENTITY_VERSION' ) ? BIZOS_IDENTITY_VERSION : '2.1.0',
            'wpVersion'     => get_bloginfo( 'version' ),
            'phpVersion'    => PHP_VERSION,
        ];
    }

    public function get_license_data() {
        $cached = get_option( 'bizos_license_data' );
        $cache_expires = get_option( 'bizos_license_cache_expires', 0 );

        if ( $cached && $cache_expires > time() ) {
            return $cached;
        }

        $key = get_option( 'bizos_license_key' );
        if ( empty( $key ) ) return null;

        $result = $this->validate_remote( $key, false );

        if ( is_wp_error( $result ) ) {
            $activated_at = get_option( 'bizos_license_activated_at' );
            if ( $activated_at && ( time() - $activated_at ) < ( self::GRACE_PERIOD_HOURS * 3600 ) ) {
                return $cached;
            }
            return null;
        }

        if ( empty( $result['valid'] ) ) {
            return null;
        }

        update_option( 'bizos_license_data', $result['license'] );
        update_option( 'bizos_license_cache_expires', time() + self::CACHE_DURATION );

        return $result['license'];
    }

    public function check_license_for_feature( $available, $feature ) {
        $license = $this->get_license_data();
        if ( ! $license ) return false;
        return in_array( $feature, $license['features'] ?? [], true );
    }

    public function is_valid_format( $key ) {
        return preg_match( '/^BIZOS-[A-Z0-9]{3,4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/', strtoupper( trim( $key ) ) ) === 1;
    }

    public function daily_license_check() {
        $key = get_option( 'bizos_license_key' );
        if ( ! empty( $key ) ) {
            $this->validate_remote( $key, false );
        }
    }

    private function check_grace_period() {
        $cached = get_option( 'bizos_license_data' );
        if ( $cached ) {
            return [ 'valid' => true, 'license' => $cached, 'grace' => true ];
        }
        return [ 'valid' => false, 'error' => 'SERVICE_UNAVAILABLE' ];
    }
}
