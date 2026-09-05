<?php
namespace BizosIdentity\Auth;

class Bizos_2FA {

    public function generate_backup_codes() {
        $codes = [];
        for ( $i = 0; $i < 10; $i++ ) {
            $codes[] = sprintf( '%04d-%04d', rand(1000, 9999), rand(1000, 9999) );
        }
        return $codes;
    }
}
