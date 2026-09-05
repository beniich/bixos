<?php
namespace BizosIdentity\Auth;

class Bizos_Magic_Link {

    private const TOKEN_LENGTH = 32;
    private const EXPIRY_MINUTES = 15;

    public function request( $email ) {
        $email = strtolower( trim( $email ) );
        if ( ! is_email( $email ) ) {
            throw new \Exception( 'Email invalide' );
        }

        $token = bin2hex( random_bytes( self::TOKEN_LENGTH ) );
        $token_hash = hash( 'sha256', $token );

        return [
            'email' => $email,
            'token' => $token,
            'expires_at' => date( 'Y-m-d H:i:s', time() + self::EXPIRY_MINUTES * 60 ),
        ];
    }
}
